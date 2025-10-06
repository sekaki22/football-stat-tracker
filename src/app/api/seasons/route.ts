import { NextRequest, NextResponse } from 'next/server'
import { PlayerService } from '@/lib/services/playerService'
import { withAdminAuth } from '@/lib/middleware'

export async function GET() {
  try {
    const seasons = await PlayerService.getAvailableSeasons()
    return NextResponse.json(seasons)
  } catch (error) {
    console.error('Error fetching seasons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch seasons' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return withAdminAuth(request, async () => {
  try {
    const { season } = await request.json()

    if (!season) {
      return NextResponse.json(
        { error: 'Season is required' },
        { status: 400 }
      )
    }

    // Validate season format (optional - you can customize this)
    const seasonRegex = /^\d{2}\/\d{2}$/
    if (!seasonRegex.test(season)) {
      return NextResponse.json(
        { error: 'Season must be in format YY/YY (e.g., 24/25)' },
        { status: 400 }
      )
    }

    // Create a dummy season stat to initialize the season
    // This ensures the season appears in the list
    await PlayerService.initializeSeason(season)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating season:', error)
    return NextResponse.json(
      { error: 'Failed to create season' },
      { status: 500 }
    )
  }
  })
} 