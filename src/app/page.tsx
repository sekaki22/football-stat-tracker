import { prisma } from '@/lib/prisma'
import SeasonWrapper from '@/components/SeasonWrapper'
import SignInButton from '@/components/SignInButton'

export default async function Home() {
  // Get all players for initial load (24/25 season)
  const players = await prisma.player.findMany({
    orderBy: {
      goals: 'desc',
    },
  })

  return (
    <main className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <img src="/logo.jpeg" alt="Logo" className="h-10 w-10 rounded" />
          <h1 className="text-4xl font-bold text-gray-100">Quick 1888 Zaterdag 2 teampagina</h1>
        </div>
        <SignInButton />
      </div>
      
      <SeasonWrapper initialPlayers={players} />
    </main>
  )
}
