import { prisma } from '@/lib/prisma'
import { Player } from '@prisma/client'

// Types for raw SQL query results
type SeasonStatsRow = {
  playerId: number
  goals: number
  assists: number
}

type SeasonRow = {
  season: string
}

export class PlayerService {
  static async getPlayers(): Promise<Player[]> {
    return prisma.player.findMany({
      orderBy: { goals: 'desc' }
    })
  }

  static async getPlayersBySeason(season: string): Promise<Player[]> {
    // Get all players first
    const players = await prisma.player.findMany()
    
    // Get season-specific stats for the requested season
    const seasonStats = await prisma.$queryRaw<SeasonStatsRow[]>`
      SELECT playerId, goals, assists 
      FROM SeasonStats 
      WHERE season = ${season}
    `

    return players.map(player => {
      const stats = seasonStats.find(s => s.playerId === player.id)
      return {
        ...player,
        goals: stats?.goals || 0,
        assists: stats?.assists || 0
      }
    }).sort((a, b) => {
      const aTotal = a.goals + a.assists
      const bTotal = b.goals + b.assists
      return bTotal - aTotal
    })
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

  static async createPlayer(name: string, goals: number = 0, assists: number = 0): Promise<Player> {
    return prisma.player.create({
      data: {
        name,
        goals,
        assists
      }
    })
  }

  static async updatePlayer(playerId: number, data: { goals?: number; assists?: number }): Promise<Player> {
    return prisma.player.update({
      where: { id: playerId },
      data
    })
  }

  static async deletePlayer(playerId: number): Promise<Player> {
    return prisma.player.delete({
      where: { id: playerId }
    })
  }

  // Get all available seasons
  static async getAvailableSeasons(): Promise<string[]> {
    const seasons = await prisma.$queryRaw<SeasonRow[]>`
      SELECT DISTINCT season 
      FROM SeasonStats 
      ORDER BY season
    `
    
    return seasons.map(s => s.season)
  }

  // Initialize a new season (creates a dummy entry to ensure the season exists)
  static async initializeSeason(season: string): Promise<void> {
    // Get the first player to create a dummy entry
    const firstPlayer = await prisma.player.findFirst()
    
    if (firstPlayer) {
      await prisma.$executeRaw`
        INSERT OR IGNORE INTO SeasonStats (playerId, season, goals, assists, createdAt, updatedAt)
        VALUES (${firstPlayer.id}, ${season}, 0, 0, datetime('now'), datetime('now'))
      `
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