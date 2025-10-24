export function calculateCurrentWeek(currentDate: Date) {

    const currentYear = currentDate.getFullYear()
    const startOfYear = new Date(currentYear, 0, 1)
    const dayMs = 24 * 60 * 60 * 1000
    const startOfToday = new Date(currentYear, currentDate.getMonth(), currentDate.getDate())
    const dayOfYear = Math.floor((startOfToday.getTime() - startOfYear.getTime()) / dayMs) + 1
    // get day number of week (0 index from sunday)
    const jan1Dow = startOfYear.getDay() // 0=Sun..6=Sat
    // remap to 0 index from monday
    const jan1MonIndex = (jan1Dow + 6) % 7 // 0=Mon..6=Sun
    // calculate current week
    const currentWeek = Math.ceil((dayOfYear + jan1MonIndex) / 7)

    return currentWeek
}

