import { prisma } from '@/lib/prisma'

export class CorveeService {
  static async getActiveSeasonForWeek(year: number, week: number): Promise<string | null> {
    const planning = await prisma.corveePlanning.findFirst({
      where: { year, week },
      orderBy: { season: 'desc' },
      select: { season: true },
    })

    return planning?.season ?? null
  }

  static async getLatestSeason(): Promise<string | null> {
    const latest = await prisma.corveePlanning.findFirst({
      orderBy: [{ season: 'desc' }],
      select: { season: true },
    })

    return latest?.season ?? null
  }

  static async resolveSeason(season?: string | null): Promise<string | null> {
    if (season) return season

    const now = new Date()
    const { calculateCurrentWeek } = await import('@/lib/weekCalculator')
    const active = await this.getActiveSeasonForWeek(
      now.getFullYear(),
      calculateCurrentWeek(now)
    )

    return active ?? this.getLatestSeason()
  }

  static getPlayerDisplayName(player: {
    nickname: string | null
    name: string
  }): string {
    return player.nickname ?? player.name
  }
}
