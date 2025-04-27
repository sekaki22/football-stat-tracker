import { prisma } from '@/lib/prisma'
import PlayerList from '@/components/PlayerList'
import PlayerStats from '@/components/PlayerStats'
import AddGoalForm from '@/components/AddGoalForm'
import AddPlayerForm from '@/components/AddPlayerForm'

export default async function Home() {
  const players = await prisma.player.findMany({
    orderBy: {
      goals: 'desc',
    },
  })

  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100">Football Team Statistics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Top Scorers</h2>
          <PlayerList players={players} />
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Player Statistics</h2>
          <PlayerStats players={players} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Add Player</h2>
          <AddPlayerForm />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Add Goal/Assist</h2>
          <AddGoalForm players={players} />
        </div>
      </div>
    </main>
  )
}
