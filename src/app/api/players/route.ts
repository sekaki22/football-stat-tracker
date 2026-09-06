import { NextRequest, NextResponse } from 'next/server'
import { PlayerService } from '@/lib/services/playerService'
import { withAdminAuth } from '@/lib/middleware'

// Ensure this route is never statically cached
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const season = searchParams.get('season')
    
    let players
    if (season) {
      players = await PlayerService.getPlayersBySeason(season)
    } else {
      players = await PlayerService.getPlayers()
    }
    
    return NextResponse.json(players)
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return withAdminAuth(request, async () => {
  try {
    const { name, goals, assists, season, nickname, playerId } = await request.json()
    const { SeasonService } = await import('@/lib/services/seasonService')

    // Attach an existing player to a season roster
    if (playerId != null) {
      if (!season) {
        return NextResponse.json(
          { error: 'Season is required when adding an existing player' },
          { status: 400 }
        )
      }

      const parsedId = typeof playerId === 'number' ? playerId : parseInt(playerId, 10)
      if (isNaN(parsedId)) {
        return NextResponse.json({ error: 'Invalid player ID' }, { status: 400 })
      }

      const existing = await PlayerService.getPlayerById(parsedId)
      if (!existing) {
        return NextResponse.json({ error: 'Player not found' }, { status: 404 })
      }

      await SeasonService.addPlayerToSeason(parsedId, season)
      return NextResponse.json(existing)
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const player = await PlayerService.createPlayer(
      name,
      goals ? parseInt(goals) : 0,
      assists ? parseInt(assists) : 0,
      nickname
    )

    if (season) {
      await SeasonService.addPlayerToSeason(player.id, season)
    }

    return NextResponse.json(player)
  } catch (error) {
    console.error('Error creating player:', error)
    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    )
  }
  })
} 