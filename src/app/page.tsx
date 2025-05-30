import { prisma } from '@/lib/prisma'
import PlayerList from '@/components/PlayerList'
import PlayerStats from '@/components/PlayerStats'
import AddGoalForm from '@/components/AddGoalForm'
import AddPlayerForm from '@/components/AddPlayerForm'
import SignInButton from '@/components/SignInButton'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'

export default async function Home() {
  const session = await getServerSession(authOptions)
  const players = await prisma.player.findMany({
    orderBy: {
      goals: 'desc',
    },
  })

  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Football Team Statistics</h1>
        <SignInButton />
      </div>
      
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

      {session?.user?.isAdmin && (
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
      )}
    </main>
  )
}
