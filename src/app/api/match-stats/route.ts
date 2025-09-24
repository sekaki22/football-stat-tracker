import { NextResponse } from 'next/server'
import { PlayerService } from '@/lib/services/playerService'

export async function POST(request: Request) {
  try {
    const { playerId, season, goals, assists } = await request.json()

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

    // Get current stats for the player in this season
    const players = await PlayerService.getPlayersBySeason(season)
    const currentPlayer = players.find(p => p.id === parseInt(playerId))
    
    if (!currentPlayer) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    // Add the match stats to current season totals
    const newGoals = currentPlayer.goals + (goals || 0)
    const newAssists = currentPlayer.assists + (assists || 0)

    const updatedPlayer = await PlayerService.updatePlayerSeasonStats(
      parseInt(playerId), 
      season, 
      { 
        goals: newGoals, 
        assists: newAssists 
      }
    )

    return NextResponse.json(updatedPlayer)
  } catch (error) {
    console.error('Error updating match stats:', error)
    return NextResponse.json(
      { error: 'Failed to update match statistics' },
      { status: 500 }
    )
  }
}
