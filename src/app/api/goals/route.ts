import { NextRequest, NextResponse } from 'next/server'
import { PlayerService } from '@/lib/services/playerService'
import { withAdminAuth } from '@/lib/middleware'

export async function POST(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const { playerId, season } = await request.json()

      if (!playerId) {
        return NextResponse.json(
          { error: 'Player ID is required' },
          { status: 400 }
        )
      }

      if (!season) {
        return NextResponse.json(
          { error: 'Season is required' },
          { status: 400 }
        )
      }

      const updatedPlayer = await PlayerService.addGoal(parseInt(playerId), season)
      return NextResponse.json(updatedPlayer)
    } catch (error) {
      console.error('Error adding goal:', error)
      return NextResponse.json(
        { error: 'Failed to add goal' },
        { status: 500 }
      )
    }
  })
} 