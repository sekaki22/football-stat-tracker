import { NextResponse } from 'next/server'
import { PlayerService } from '@/lib/services/playerService'

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

export async function POST(request: Request) {
  try {
    const { name, goals, assists } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const player = await PlayerService.createPlayer(
      name,
      goals ? parseInt(goals) : 0,
      assists ? parseInt(assists) : 0
    )
    return NextResponse.json(player)
  } catch (error) {
    console.error('Error creating player:', error)
    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    )
  }
} 