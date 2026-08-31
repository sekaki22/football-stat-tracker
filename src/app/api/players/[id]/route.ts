import { NextRequest, NextResponse } from 'next/server'
import { PlayerService } from '@/lib/services/playerService'
import { withAdminAuth } from '@/lib/middleware'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    try {
      const { goals, assists, name, nickname } = await request.json()
      const { id } = await params
      const playerId = parseInt(id)

      if (isNaN(playerId)) {
        return NextResponse.json(
          { error: 'Invalid player ID' },
          { status: 400 }
        )
      }

      const updatedPlayer = await PlayerService.updatePlayer(playerId, {
        name,
        nickname,
        goals: goals !== undefined ? parseInt(goals) : undefined,
        assists: assists !== undefined ? parseInt(assists) : undefined,
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
      const { goals, assists, season, name, nickname } = await request.json()
      const { id } = await params
      const playerId = parseInt(id)

      if (isNaN(playerId)) {
        return NextResponse.json(
          { error: 'Invalid player ID' },
          { status: 400 }
        )
      }

      if (name !== undefined || nickname !== undefined) {
        await PlayerService.updatePlayer(playerId, { name, nickname })
      }

      if (season && (goals !== undefined || assists !== undefined)) {
        await PlayerService.updatePlayerSeasonStats(playerId, season, {
          goals: goals !== undefined ? parseInt(goals) : undefined,
          assists: assists !== undefined ? parseInt(assists) : undefined,
        })
      } else if (goals !== undefined || assists !== undefined) {
        await PlayerService.updatePlayer(playerId, {
          goals: goals !== undefined ? parseInt(goals) : undefined,
          assists: assists !== undefined ? parseInt(assists) : undefined,
        })
      }

      const updatedPlayer = await PlayerService.getPlayerById(playerId)
      if (!updatedPlayer) {
        return NextResponse.json({ error: 'Player not found' }, { status: 404 })
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
