import { NextResponse } from 'next/server'
import { PlayerService } from '@/lib/services/playerService'

export async function POST(request: Request) {
  try {
    const { playerId } = await request.json()

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      )
    }

    const updatedPlayer = await PlayerService.addGoal(parseInt(playerId))
    return NextResponse.json(updatedPlayer)
  } catch (error) {
    console.error('Error adding goal:', error)
    return NextResponse.json(
      { error: 'Failed to add goal' },
      { status: 500 }
    )
  }
} 