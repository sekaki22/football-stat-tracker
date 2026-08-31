export type WeekYear = {
  year: number
  week: number
}

export function calculateCurrentWeek(currentDate: Date): number {
  const currentYear = currentDate.getFullYear()
  const startOfYear = new Date(currentYear, 0, 1)
  const dayMs = 24 * 60 * 60 * 1000
  const startOfToday = new Date(currentYear, currentDate.getMonth(), currentDate.getDate())
  const dayOfYear = Math.floor((startOfToday.getTime() - startOfYear.getTime()) / dayMs) + 1
  const jan1Dow = startOfYear.getDay()
  const jan1MonIndex = (jan1Dow + 6) % 7
  return Math.ceil((dayOfYear + jan1MonIndex) / 7)
}

export function getCurrentWeekYear(date: Date = new Date()): WeekYear {
  return {
    year: date.getFullYear(),
    week: calculateCurrentWeek(date),
  }
}

export function getMondayOfWeek(year: number, week: number): Date {
  const startOfYear = new Date(year, 0, 1)
  const jan1Dow = startOfYear.getDay()
  const dayOfWeekJan1 = (jan1Dow + 6) % 7
  const mondayWeek1 = new Date(year, 0, 1 - dayOfWeekJan1)
  const monday = new Date(mondayWeek1)
  monday.setDate(mondayWeek1.getDate() + (week - 1) * 7)
  return monday
}

export function getWeekYearFromDate(date: Date): WeekYear {
  return {
    year: date.getFullYear(),
    week: calculateCurrentWeek(date),
  }
}

export function compareWeekYear(a: WeekYear, b: WeekYear): number {
  if (a.year !== b.year) return a.year - b.year
  return a.week - b.week
}

export function iterateWeekRange(
  start: WeekYear,
  end: WeekYear
): WeekYear[] {
  const weeks: WeekYear[] = []
  let current = getMondayOfWeek(start.year, start.week)
  const endMonday = getMondayOfWeek(end.year, end.week)

  while (current <= endMonday) {
    weeks.push(getWeekYearFromDate(current))
    current = new Date(current)
    current.setDate(current.getDate() + 7)
  }

  return weeks
}

export function parseSeasonEndYear(season: string): number | null {
  const match = season.match(/^\d{2}\/(\d{2})$/)
  if (!match) return null
  return 2000 + parseInt(match[1], 10)
}
