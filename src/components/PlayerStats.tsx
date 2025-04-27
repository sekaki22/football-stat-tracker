import { Player } from '@prisma/client'

interface PlayerStatsProps {
  players: Player[]
}

export default function PlayerStats({ players }: PlayerStatsProps) {
  // Find all players with the highest goals
  const maxGoals = Math.max(...players.map(p => p.goals))
  const topScorers = players.filter(p => p.goals === maxGoals)

  // Find all players with the highest assists
  const maxAssists = Math.max(...players.map(p => p.assists))
  const topAssisters = players.filter(p => p.assists === maxAssists)

  // Find all players with the highest total points (goals + assists)
  const maxPoints = Math.max(...players.map(p => p.goals + p.assists))
  const mvps = players.filter(p => p.goals + p.assists === maxPoints)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">MVP</h3>
          <div className="space-y-1">
            {mvps.map((mvp, index) => (
              <p key={mvp.id} className="text-gray-700 dark:text-gray-300">
                {mvp.name} - {mvp.goals + mvp.assists} points ({mvp.goals} goals + {mvp.assists} assists)
              </p>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Top Scorers</h3>
          <div className="space-y-1">
            {topScorers.map((scorer, index) => (
              <p key={scorer.id} className="text-gray-700 dark:text-gray-300">
                {scorer.name} - {scorer.goals} goals
              </p>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Top Assisters</h3>
          <div className="space-y-1">
            {topAssisters.map((assister, index) => (
              <p key={assister.id} className="text-gray-700 dark:text-gray-300">
                {assister.name} - {assister.assists} assists
              </p>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Total Goals</h3>
          <p className="text-gray-700 dark:text-gray-300">{players.reduce((sum, player) => sum + player.goals, 0)}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Total Assists</h3>
          <p className="text-gray-700 dark:text-gray-300">{players.reduce((sum, player) => sum + player.assists, 0)}</p>
        </div>
      </div>
    </div>
  )
} 