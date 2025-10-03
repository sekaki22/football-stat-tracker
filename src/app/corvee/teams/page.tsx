import { prisma } from "@/lib/prisma"

// Function to get the date range for a given year and week number
function getWeekDateRange(year: number, week: number) {
  // January 4th is always in week 1 (ISO week standard)
  const jan4 = new Date(year, 0, 4)
  
  // Find the Monday of week 1
  const mondayOfWeek1 = new Date(jan4)
  mondayOfWeek1.setDate(jan4.getDate() - jan4.getDay() + 1)
  
  // Calculate the Monday of the target week
  const mondayOfTargetWeek = new Date(mondayOfWeek1)
  mondayOfTargetWeek.setDate(mondayOfWeek1.getDate() + (week - 1) * 7)
  
  // Calculate the Sunday of the target week
  const sundayOfTargetWeek = new Date(mondayOfTargetWeek)
  sundayOfTargetWeek.setDate(mondayOfTargetWeek.getDate() + 6)
  
  return {
    monday: mondayOfTargetWeek,
    sunday: sundayOfTargetWeek,
    weekString: `${mondayOfTargetWeek.getDate()}/${mondayOfTargetWeek.getMonth() + 1} - ${sundayOfTargetWeek.getDate()}/${sundayOfTargetWeek.getMonth() + 1}`
  }
}

export default async function CorveeTeamsPage(){
    const corveeTeams = await prisma.corveeTeams.findMany({
        orderBy: {
            team_letter: 'asc',
        },
    })

    const corveePlanning = await prisma.corveePlanning.findMany({
        orderBy: [
            { year: 'asc' },
            { week: 'asc' }
        ],
    })

    // Group players by team
    const teamGroups = corveeTeams.reduce((acc, team) => {
        if (!acc[team.team_letter]) {
            acc[team.team_letter] = []
        }
        acc[team.team_letter].push(team.player_nickname)
        return acc
    }, {} as Record<string, string[]>)

    // Create pivot data with date information
    const weekTeamMapping = corveePlanning.reduce((acc, planning) => {
        const weekKey = `${planning.year}-W${planning.week}`
        const dateRange = getWeekDateRange(planning.year, planning.week)
        acc[weekKey] = {
            team: planning.team_letter,
            dateRange: dateRange.weekString,
            fullDateRange: dateRange
        }
        return acc
    }, {} as Record<string, { team: string, dateRange: string, fullDateRange: any }>)

    // Get all unique weeks and sort them
    const allWeeks = [...new Set(corveePlanning.map(p => `${p.year}-W${p.week}`))]
        .sort((a, b) => {
            const [yearA, weekA] = a.split('-W').map(Number)
            const [yearB, weekB] = b.split('-W').map(Number)
            return yearA - yearB || weekA - weekB
        })

    // Get all teams
    const allTeams = Object.keys(teamGroups).sort()

    const teamColors = {
        'A': 'bg-red-500',
        'B': 'bg-blue-500', 
        'C': 'bg-green-500',
        'D': 'bg-yellow-500',
        'E': 'bg-purple-500'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Corvee Planning Overzicht
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Seizoen 25/26 • {allWeeks.length} Weken • {allTeams.length} Teams
                    </p>
                </div>

                {/* Pivoted Planning Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                        Corvee Schema
                    </h2>
                    
                    <div className="table-container">
                        <table className="table-base">
                            <thead className="table-header">
                                <tr>
                                    <th className="table-header-cell-primary">Week</th>
                                    <th className="table-header-cell-primary">Datum</th>
                                    {allTeams.map(team => (
                                        <th key={team} className="table-header-cell-primary text-center">
                                            <div className="flex items-center justify-center">
                                                <div className={`w-6 h-6 ${teamColors[team as keyof typeof teamColors]} rounded-full flex items-center justify-center mr-2`}>
                                                    <span className="text-white text-xs font-bold">{team}</span>
                                                </div>
                                                Team {team}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {allWeeks.map(week => (
                                    <tr key={week} className="table-row">
                                        <td className="table-cell font-medium">
                                            {week}
                                        </td>
                                        <td className="table-cell text-sm text-gray-600 dark:text-gray-400">
                                            {weekTeamMapping[week]?.dateRange || '-'}
                                        </td>
                                        {allTeams.map(team => (
                                            <td key={team} className="table-cell text-center">
                                                <div className="flex items-center justify-center">
                                                    {weekTeamMapping[week]?.team === team ? (
                                                        <div className={`w-8 h-8 ${teamColors[team as keyof typeof teamColors]} rounded-full flex items-center justify-center shadow-md`}>
                                                            <span className="text-white text-sm font-bold">✓</span>
                                                        </div>
                                                    ) : (
                                                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center shadow-md">
                                                            <span className="text-gray-400 text-sm font-medium">-</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Team Members Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                    {Object.entries(teamGroups).map(([teamLetter, players]) => (
                        <div 
                            key={teamLetter}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                        >
                            {/* Team Header */}
                            <div className={`${teamColors[teamLetter as keyof typeof teamColors] || 'bg-gray-500'} p-4 text-center`}>
                                <div className="text-white">
                                    <div className="text-2xl font-bold">
                                        Team {teamLetter}
                                    </div>
                                </div>
                            </div>

                            {/* Players List */}
                            <div className="p-4">
                                <div className="space-y-2">
                                    {players.map((player, index) => (
                                        <div 
                                            key={index}
                                            className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-gray-100"
                                        >
                                            {player}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}