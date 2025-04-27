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
        assists: {
          increment: 1,
        },
      },
    })

    return NextResponse.json(player)
  } catch (error) {
    console.error('Error adding assist:', error)
    return NextResponse.json(
      { error: 'Failed to add assist' },
      { status: 500 }
    )
  }
} 