import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      orderBy: {
        goals: 'desc',
      },
    })
    return NextResponse.json(players)
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { name, goals, assists } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      )
    }

    const player = await prisma.player.create({
      data: {
        name,
        goals: goals || 0,
        assists: assists || 0,
      },
    })

    return NextResponse.json(player)
  } catch (error) {
    console.error('Error adding player:', error)
    return NextResponse.json(
      { error: 'Failed to add player' },
      { status: 500 }
    )
  }
} 