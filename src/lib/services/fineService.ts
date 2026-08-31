import { prisma } from '@/lib/prisma'

const activeFineFilter = { active: true } as const

export class FineService {
  static async getFineTypes() {
    return await prisma.fineInformation.findMany({
      orderBy: {
        fine_type: 'asc',
      },
    })
  }

  static async getFineTypeById(id: number) {
    return await prisma.fineInformation.findUnique({
      where: { id },
    })
  }

  static async addFineToPlayer(playerId: number, fineTypeId: number, customAmount?: number) {
    const fineType = await prisma.fineInformation.findUnique({
      where: { id: fineTypeId },
    })

    if (!fineType) {
      throw new Error('Fine type not found')
    }

    const amount = customAmount ?? fineType.fine_amount

    return await prisma.fine.create({
      data: {
        player_id: playerId,
        fine_type_id: fineTypeId,
        fine_amount: amount,
        active: true,
      },
      include: {
        fineInfo: true,
        player: true,
      },
    })
  }

  static async getPlayerFines(playerId: number, activeOnly = true) {
    return await prisma.fine.findMany({
      where: {
        player_id: playerId,
        ...(activeOnly ? activeFineFilter : {}),
      },
      include: {
        fineInfo: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  static async getAllFines(activeOnly = true) {
    return await prisma.fine.findMany({
      where: activeOnly ? activeFineFilter : undefined,
      include: {
        fineInfo: true,
        player: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  static async getPlayerFineTotal(playerId: number) {
    const result = await prisma.fine.aggregate({
      where: {
        player_id: playerId,
        ...activeFineFilter,
      },
      _sum: {
        fine_amount: true,
      },
    })

    return result._sum.fine_amount ?? 0
  }

  static async resetFinePot() {
    return await prisma.fine.updateMany({
      where: activeFineFilter,
      data: { active: false },
    })
  }

  static async deleteFine(fineId: number) {
    return await prisma.fine.delete({
      where: { id: fineId },
    })
  }

  static async updateFineAmount(fineId: number, newAmount: number) {
    return await prisma.fine.update({
      where: { id: fineId },
      data: { fine_amount: newAmount },
    })
  }
}
