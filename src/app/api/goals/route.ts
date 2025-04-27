import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { playerId } = await request.json()

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      )
    }

    const player = await prisma.player.update({
      where: { id: parseInt(playerId) },
      data: {
        goals: {
          increment: 1,
        },
      },
    })

    return NextResponse.json(player)
  } catch (error) {
    console.error('Error adding goal:', error)
    return NextResponse.json(
      { error: 'Failed to add goal' },
      { status: 500 }
    )
  }
} 