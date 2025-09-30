import { prisma } from '@/lib/prisma'
import SeasonWrapper from '@/components/SeasonWrapper'

export default async function Home() {
  // Get all players for initial load (24/25 season)
  const players = await prisma.player.findMany({
    orderBy: {
      goals: 'desc',
    },
  })

  return (
    <main className="min-h-screen p-8">
      
      <SeasonWrapper initialPlayers={players} />
    </main>
  )
}
