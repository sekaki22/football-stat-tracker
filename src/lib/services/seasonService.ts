import { prisma } from '@/lib/prisma'
import { Player } from '@prisma/client'
import { assignPlayersToCorveeTeamsRandomly } from '@/lib/corveeTeamGenerator'
import { generateRotatingCorveePlanning } from '@/lib/corveePlanningGenerator'
import { CorveeService } from '@/lib/services/corveeService'
import { WeekYear } from '@/lib/weekCalculator'

type SeasonStatsRow = {
  playerId: number
  goals: number
  assists: number
}

export type CorveeTeamAssignments = Record<string, string[]>

export type SeasonOnboardingInput = {
  season: string
  existingPlayerIds: number[]
  newPlayers: { name: string; nickname?: string }[]
  periodStart: WeekYear
  periodEnd: WeekYear
}

export class SeasonService {
  static async getAvailableSeasons(): Promise<string[]> {
    const fromRoster = await prisma.seasonPlayer.findMany({
      select: { season: true },
      distinct: ['season'],
      orderBy: { season: 'asc' },
    })

    const fromStats = await prisma.seasonStats.findMany({
      select: { season: true },
      distinct: ['season'],
      orderBy: { season: 'asc' },
    })

    const seasons = new Set([
      ...fromRoster.map((s) => s.season),
      ...fromStats.map((s) => s.season),
    ])

    return Array.from(seasons).sort()
  }

  static async getPlayersBySeason(season: string): Promise<Player[]> {
    const seasonPlayers = await prisma.seasonPlayer.findMany({
      where: { season },
      include: { player: true },
    })

    const seasonStats = await prisma.$queryRaw<SeasonStatsRow[]>`
      SELECT playerId, goals, assists
      FROM SeasonStats
      WHERE season = ${season}
    `

    return seasonPlayers
      .map(({ player }) => {
        const stats = seasonStats.find((s) => s.playerId === player.id)
        return {
          ...player,
          goals: stats?.goals ?? 0,
          assists: stats?.assists ?? 0,
        }
      })
      .sort((a, b) => b.goals + b.assists - (a.goals + a.assists))
  }

  static async getSeasonPlayerIds(season: string): Promise<number[]> {
    const rows = await prisma.seasonPlayer.findMany({
      where: { season },
      select: { playerId: true },
    })
    return rows.map((r) => r.playerId)
  }

  static async addPlayerToSeason(playerId: number, season: string): Promise<void> {
    await prisma.$transaction([
      prisma.seasonPlayer.upsert({
        where: { playerId_season: { playerId, season } },
        create: { playerId, season },
        update: {},
      }),
      prisma.seasonStats.upsert({
        where: { playerId_season: { playerId, season } },
        create: { playerId, season, goals: 0, assists: 0 },
        update: {},
      }),
    ])
  }

  static async removePlayerFromSeason(playerId: number, season: string): Promise<void> {
    await prisma.seasonPlayer.delete({
      where: { playerId_season: { playerId, season } },
    })
  }

  static async getCorveeTeams(season: string) {
    return prisma.corveeTeams.findMany({
      where: { season },
      include: { player: true },
      orderBy: [{ team_letter: 'asc' }, { player: { nickname: 'asc' } }],
    })
  }

  static async getCorveeTeamsGrouped(season: string): Promise<CorveeTeamAssignments> {
    const teams = await this.getCorveeTeams(season)
    const grouped: CorveeTeamAssignments = { A: [], B: [], C: [], D: [], E: [] }

    for (const entry of teams) {
      if (grouped[entry.team_letter]) {
        grouped[entry.team_letter].push(CorveeService.getPlayerDisplayName(entry.player))
      }
    }

    return grouped
  }

  static async createSeason(input: SeasonOnboardingInput): Promise<void> {
    const { season, existingPlayerIds, newPlayers, periodStart, periodEnd } = input

    const existingSeason = await prisma.seasonPlayer.findFirst({
      where: { season },
    })
    if (existingSeason) {
      throw new Error('Season already exists')
    }

    const planningEntries = generateRotatingCorveePlanning(season, periodStart, periodEnd)
    const allPlayerIds = [...existingPlayerIds]

    await prisma.$transaction(async (tx) => {
      for (const { name, nickname } of newPlayers) {
        const player = await tx.player.create({
          data: {
            name,
            nickname: nickname?.trim() || null,
          },
        })
        allPlayerIds.push(player.id)
      }

      for (const playerId of allPlayerIds) {
        await tx.seasonPlayer.create({ data: { playerId, season } })
        await tx.seasonStats.create({
          data: { playerId, season, goals: 0, assists: 0 },
        })
      }

      const corveeAssignments = assignPlayersToCorveeTeamsRandomly(allPlayerIds)

      for (const [letter, playerIds] of Object.entries(corveeAssignments)) {
        for (const playerId of playerIds) {
          await tx.corveeTeams.create({
            data: {
              season,
              team_letter: letter,
              playerId,
            },
          })
        }
      }

      for (const entry of planningEntries) {
        await tx.corveePlanning.create({ data: entry })
      }
    })
  }
}
