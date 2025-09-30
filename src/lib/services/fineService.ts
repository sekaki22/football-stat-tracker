import { prisma } from '@/lib/prisma'

export class FineService {
  /**
   * Get all fine types (reference data)
   */
  static async getFineTypes() {
    return await prisma.fineInformation.findMany({
      orderBy: {
        fine_type: 'asc'
      }
    })
  }

  /**
   * Get a specific fine type by ID
   */
  static async getFineTypeById(id: number) {
    return await prisma.fineInformation.findUnique({
      where: { id }
    })
  }

  /**
   * Add a fine to a player (using fine type reference)
   */
  static async addFineToPlayer(playerId: number, fineTypeId: number, customAmount?: number) {
    // Get the fine type information
    const fineType = await prisma.fineInformation.findUnique({
      where: { id: fineTypeId }
    })

    if (!fineType) {
      throw new Error('Fine type not found')
    }

    // Use custom amount if provided, otherwise use default from fine type
    const amount = customAmount ?? fineType.fine_amount

    return await prisma.fine.create({
      data: {
        player_id: playerId,
        fine_type_id: fineTypeId,
        fine_amount: amount
      },
      include: {
        fineInfo: true,
        player: true
      }
    })
  }

  /**
   * Get all fines for a player
   */
  static async getPlayerFines(playerId: number) {
    return await prisma.fine.findMany({
      where: {
        player_id: playerId
      },
      include: {
        fineInfo: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  /**
   * Get all fines with player and fine type information
   */
  static async getAllFines() {
    return await prisma.fine.findMany({
      include: {
        fineInfo: true,
        player: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  /**
   * Calculate total fines for a player
   */
  static async getPlayerFineTotal(playerId: number) {
    const result = await prisma.fine.aggregate({
      where: {
        player_id: playerId
      },
      _sum: {
        fine_amount: true
      }
    })

    return result._sum.fine_amount ?? 0
  }

  /**
   * Delete a fine
   */
  static async deleteFine(fineId: number) {
    return await prisma.fine.delete({
      where: { id: fineId }
    })
  }

  /**
   * Update fine amount (in case of custom amounts)
   */
  static async updateFineAmount(fineId: number, newAmount: number) {
    return await prisma.fine.update({
      where: { id: fineId },
      data: { fine_amount: newAmount }
    })
  }
}
