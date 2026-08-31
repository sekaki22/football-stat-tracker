import { NextRequest, NextResponse } from 'next/server'
import { SeasonService, SeasonOnboardingInput } from '@/lib/services/seasonService'
import { withAdminAuth } from '@/lib/middleware'
import { compareWeekYear } from '@/lib/weekCalculator'

const SEASON_REGEX = /^\d{2}\/\d{2}$/

function validateSeason(season: string): string | null {
  if (!SEASON_REGEX.test(season)) {
    return 'Season must be in format YY/YY (e.g., 24/25)'
  }
  return null
}

function validatePeriod(start: { year: number; week: number }, end: { year: number; week: number }): string | null {
  if (!start?.year || !start?.week || !end?.year || !end?.week) {
    return 'Season start and end (year + week) are required'
  }
  if (start.week < 1 || start.week > 53 || end.week < 1 || end.week > 53) {
    return 'Week must be between 1 and 53'
  }
  if (compareWeekYear(start, end) > 0) {
    return 'Season start must be before or equal to season end'
  }
  return null
}

export async function GET() {
  try {
    const seasons = await SeasonService.getAvailableSeasons()
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
      const body = await request.json()

      if (!body.season) {
        return NextResponse.json(
          { error: 'Season is required' },
          { status: 400 }
        )
      }

      const seasonError = validateSeason(body.season)
      if (seasonError) {
        return NextResponse.json({ error: seasonError }, { status: 400 })
      }

      const periodStart = { year: Number(body.periodStart?.year), week: Number(body.periodStart?.week) }
      const periodEnd = { year: Number(body.periodEnd?.year), week: Number(body.periodEnd?.week) }
      const periodError = validatePeriod(periodStart, periodEnd)
      if (periodError) {
        return NextResponse.json({ error: periodError }, { status: 400 })
      }

      const input: SeasonOnboardingInput = {
        season: body.season,
        existingPlayerIds: body.existingPlayerIds ?? [],
        newPlayers: body.newPlayers ?? [],
        periodStart,
        periodEnd,
      }

      const totalPlayers = input.existingPlayerIds.length + input.newPlayers.length
      if (totalPlayers === 0) {
        return NextResponse.json(
          { error: 'At least one player is required' },
          { status: 400 }
        )
      }

      await SeasonService.createSeason(input)

      return NextResponse.json({ success: true, season: input.season })
    } catch (error) {
      console.error('Error creating season:', error)
      const message = error instanceof Error ? error.message : 'Failed to create season'
      const status = message === 'Season already exists' ? 409 : 500
      return NextResponse.json({ error: message }, { status })
    }
  })
}
