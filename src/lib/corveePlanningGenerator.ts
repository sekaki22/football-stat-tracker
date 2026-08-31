import { iterateWeekRange, WeekYear } from '@/lib/weekCalculator'

const TEAM_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const

export type CorveePlanningEntry = {
  season: string
  team_letter: string
  year: number
  week: number
}

export function generateRotatingCorveePlanning(
  season: string,
  start: WeekYear,
  end: WeekYear,
  startingTeamIndex = 0
): CorveePlanningEntry[] {
  const weeks = iterateWeekRange(start, end)

  return weeks.map((entry, index) => ({
    season,
    team_letter: TEAM_LETTERS[(startingTeamIndex + index) % TEAM_LETTERS.length],
    year: entry.year,
    week: entry.week,
  }))
}
