import { NextResponse } from 'next/server'
import { PlayerService } from '@/lib/services/playerService'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { goals, assists } = await request.json()
    const playerId = parseInt(params.id)

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
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const playerId = parseInt(params.id)

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
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { goals, assists } = await request.json()
    const playerId = parseInt(params.id)

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
} 