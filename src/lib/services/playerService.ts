import { prisma } from '@/lib/prisma'
import { Player } from '@prisma/client'
import { SeasonService } from '@/lib/services/seasonService'

// Types for raw SQL query results
type SeasonStatsRow = {
  playerId: number
  goals: number
  assists: number
}

export class PlayerService {
  static async getPlayers(): Promise<Player[]> {
    return prisma.player.findMany({
      orderBy: { goals: 'desc' }
    })
  }

  static async getPlayersBySeason(season: string): Promise<Player[]> {
    return SeasonService.getPlayersBySeason(season)
  }

  static async addGoal(playerId: number, season: string): Promise<Player> {
    // Add goal to SeasonStats table
    await prisma.$executeRaw`
      INSERT INTO SeasonStats (playerId, season, goals, assists, createdAt, updatedAt)
      VALUES (${playerId}, ${season}, 1, 0, datetime('now'), datetime('now'))
      ON CONFLICT(playerId, season) 
      DO UPDATE SET goals = goals + 1, updatedAt = datetime('now')
    `

    // Return the updated player
    const player = await prisma.player.findUnique({
      where: { id: playerId }
    })

    if (!player) {
      throw new Error('Player not found')
    }

    return player
  }

  static async addAssist(playerId: number, season: string): Promise<Player> {
    // Add assist to SeasonStats table
    await prisma.$executeRaw`
      INSERT INTO SeasonStats (playerId, season, goals, assists, createdAt, updatedAt)
      VALUES (${playerId}, ${season}, 0, 1, datetime('now'), datetime('now'))
      ON CONFLICT(playerId, season) 
      DO UPDATE SET assists = assists + 1, updatedAt = datetime('now')
    `

    // Return the updated player
    const player = await prisma.player.findUnique({
      where: { id: playerId }
    })

    if (!player) {
      throw new Error('Player not found')
    }

    return player
  }

  static async createPlayer(
    name: string,
    goals: number = 0,
    assists: number = 0,
    nickname?: string | null
  ): Promise<Player> {
    return prisma.player.create({
      data: {
        name,
        nickname: nickname?.trim() || null,
        goals,
        assists,
      },
    })
  }

  static async updatePlayer(
    playerId: number,
    data: {
      name?: string
      nickname?: string | null
      goals?: number
      assists?: number
    }
  ): Promise<Player> {
    const updateData: {
      name?: string
      nickname?: string | null
      goals?: number
      assists?: number
    } = {}

    if (data.name !== undefined) {
      updateData.name = data.name.trim()
    }
    if (data.nickname !== undefined) {
      updateData.nickname = data.nickname?.trim() || null
    }
    if (data.goals !== undefined) {
      updateData.goals = data.goals
    }
    if (data.assists !== undefined) {
      updateData.assists = data.assists
    }

    return prisma.player.update({
      where: { id: playerId },
      data: updateData,
    })
  }

  static async getPlayerById(playerId: number): Promise<Player | null> {
    return prisma.player.findUnique({ where: { id: playerId } })
  }

  static async deletePlayer(playerId: number): Promise<Player> {
    return prisma.player.delete({
      where: { id: playerId }
    })
  }

  // Get all available seasons
  static async getAvailableSeasons(): Promise<string[]> {
    return SeasonService.getAvailableSeasons()
  }

  // Initialize a new season (legacy - prefer SeasonService.createSeason)
  static async initializeSeason(season: string): Promise<void> {
    const players = await prisma.player.findMany()
    if (players.length === 0) return

    for (const player of players) {
      await SeasonService.addPlayerToSeason(player.id, season)
    }
  }

  // Update season-specific player stats
  static async updatePlayerSeasonStats(
    playerId: number, 
    season: string, 
    data: { goals?: number; assists?: number }
  ): Promise<Player> {
    // Update or create season stats
    await prisma.$executeRaw`
      INSERT INTO SeasonStats (playerId, season, goals, assists, createdAt, updatedAt)
      VALUES (${playerId}, ${season}, ${data.goals || 0}, ${data.assists || 0}, datetime('now'), datetime('now'))
      ON CONFLICT(playerId, season) 
      DO UPDATE SET 
        goals = ${data.goals !== undefined ? data.goals : 'goals'}, 
        assists = ${data.assists !== undefined ? data.assists : 'assists'}, 
        updatedAt = datetime('now')
    `

    // Return the player with updated season stats
    const player = await prisma.player.findUnique({
      where: { id: playerId }
    })

    if (!player) {
      throw new Error('Player not found')
    }

    return player
  }
} 