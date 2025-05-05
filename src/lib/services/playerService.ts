import { prisma } from '@/lib/prisma'
import { Player } from '@prisma/client'

export class PlayerService {
  static async getPlayers(): Promise<Player[]> {
    return prisma.player.findMany({
      orderBy: { goals: 'desc' }
    })
  }

  static async addGoal(playerId: number): Promise<Player> {
    return prisma.player.update({
      where: { id: playerId },
      data: { goals: { increment: 1 } }
    })
  }

  static async addAssist(playerId: number): Promise<Player> {
    return prisma.player.update({
      where: { id: playerId },
      data: { assists: { increment: 1 } }
    })
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
} 