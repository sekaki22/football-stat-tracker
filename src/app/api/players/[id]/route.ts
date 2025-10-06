import { NextRequest, NextResponse } from 'next/server'
import { PlayerService } from '@/lib/services/playerService'
import { Player } from '@prisma/client'
import { withAdminAuth } from '@/lib/middleware'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
  try {
    const { goals, assists } = await request.json()
    const { id } = await params
    const playerId = parseInt(id)

    if (isNaN(playerId)) {
      return NextResponse.json(
        { error: 'Invalid player ID' },
        { status: 400 }
      )
    }

    const updatedPlayer = await PlayerService.updatePlayer(playerId, {
      goals: goals ? parseInt(goals) : undefined,
      assists: assists ? parseInt(assists) : undefined
    })
    return NextResponse.json(updatedPlayer)
  } catch (error) {
    console.error('Error updating player:', error)
    return NextResponse.json(
      { error: 'Failed to update player' },
      { status: 500 }
    )
  }
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
  try {
    const { id } = await params
    const playerId = parseInt(id)

    if (isNaN(playerId)) {
      return NextResponse.json(
        { error: 'Invalid player ID' },
        { status: 400 }
      )
    }

    const deletedPlayer = await PlayerService.deletePlayer(playerId)
    return NextResponse.json(deletedPlayer)
  } catch (error) {
    console.error('Error deleting player:', error)
    return NextResponse.json(
      { error: 'Failed to delete player' },
      { status: 500 }
    )
  }
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
  try {
    const { goals, assists, season } = await request.json()
    const { id } = await params
    const playerId = parseInt(id)

    if (isNaN(playerId)) {
      return NextResponse.json(
        { error: 'Invalid player ID' },
        { status: 400 }
      )
    }

    let updatedPlayer: Player

    if (season) {
      // Update season-specific stats
      updatedPlayer = await PlayerService.updatePlayerSeasonStats(playerId, season, {
        goals: goals !== undefined ? parseInt(goals) : undefined,
        assists: assists !== undefined ? parseInt(assists) : undefined
      })
    } else {
      // Update main player stats (backward compatibility)
      updatedPlayer = await PlayerService.updatePlayer(playerId, {
        goals: goals !== undefined ? parseInt(goals) : undefined,
        assists: assists !== undefined ? parseInt(assists) : undefined
      })
    }

    return NextResponse.json(updatedPlayer)
  } catch (error) {
    console.error('Error updating player:', error)
    return NextResponse.json(
      { error: 'Failed to update player' },
      { status: 500 }
    )
  }
  })
} 