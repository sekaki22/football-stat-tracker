import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { calculateCurrentWeek } from '@/lib/weekCalculator'

export default async function CorveePage(){
    const currentWeek = calculateCurrentWeek(new Date())
    const currentYear = new Date().getFullYear()

    const teamInCharge = await prisma.corveePlanning.findFirst({
        select: {team_letter: true},
        where: {year: currentYear,
                week: currentWeek
        }
    })

    const corveePlayers = await prisma.corveeTeams.findMany({
        where: {team_letter: teamInCharge?.team_letter}
    })
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Corvee Planning
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Week {currentWeek} • {currentYear}
                    </p>
                </div>

                {/* Main Content Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6">
                    {teamInCharge ? (
                        <>
                            {/* Team Badge */}
                            <div className="flex items-center justify-center mb-6">
                                <div className="bg-rose-500 text-white text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
                                    {teamInCharge.team_letter}
                                </div>
                            </div>

                            {/* Team Announcement */}
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    Team {teamInCharge.team_letter} heeft deze week corvee!
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    De volgende spelers zijn aan de beurt
                                </p>
                            </div>

                            {/* Players List */}
                            {corveePlayers.length > 0 ? (
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {corveePlayers.map((player, index) => (
                                        <div 
                                            key={index}
                                            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                {player.player_nickname}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Geen spelers gevonden voor team {teamInCharge.team_letter}
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        /* No Team Found */
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🤷‍♂️</div>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Geen corvee deze week
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Er is geen team ingepland voor week {currentWeek}
                            </p>
                        </div>
                    )}
                </div>

                {/* Info Card */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Corvee Taken
                    </h3>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• Velden uitzetten voor training</li>
                        <li>• Spullen pakken en terugbrengen</li>
                        <li>• Ballen oppompen en waterzak vullen</li>
                        <li>• Kleedkamer netjes maken na training/wedstrijd</li>
                    </ul>
                </div>
            <div className="text-left p-4">
                <Link className="text-rose-500 dark:text-rose-500 hover:text-blue-600 dark:hover:text-blue-300" href="/corvee/teams"> Klik hier om de corvee teams en planning te zien </Link>
            </div>
            </div>
        </div>
    )
}