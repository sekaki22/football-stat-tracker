import { NextRequest, NextResponse } from 'next/server'
import { SeasonService } from '@/lib/services/seasonService'
import { withAdminAuth } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const season = searchParams.get('season')

    if (!season) {
      return NextResponse.json(
        { error: 'Season query parameter is required' },
        { status: 400 }
      )
    }

    const teams = await SeasonService.getCorveeTeamsGrouped(season)
    return NextResponse.json(teams)
  } catch (error) {
    console.error('Error fetching corvee teams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch corvee teams' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const { season, corveeTeams } = await request.json()

      if (!season || !corveeTeams) {
        return NextResponse.json(
          { error: 'Season and corveeTeams are required' },
          { status: 400 }
        )
      }

      const { prisma } = await import('@/lib/prisma')

      await prisma.$transaction(async (tx) => {
        await tx.corveeTeams.deleteMany({ where: { season } })

        for (const [letter, playerIds] of Object.entries(corveeTeams)) {
          if (!Array.isArray(playerIds)) continue

          for (const playerId of playerIds) {
            const id = Number(playerId)
            if (!id) continue

            await tx.corveeTeams.create({
              data: {
                season,
                team_letter: letter,
                playerId: id,
              },
            })
          }
        }
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error updating corvee teams:', error)
      return NextResponse.json(
        { error: 'Failed to update corvee teams' },
        { status: 500 }
      )
    }
  })
}
