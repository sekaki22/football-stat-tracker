import { prisma } from '@/lib/prisma'
import SeasonWrapper from '@/components/SeasonWrapper'
import SignInButton from '@/components/SignInButton'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  // Get all players for initial load (24/25 season)
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
      
      <SeasonWrapper initialPlayers={players} />
    </main>
  )
}
