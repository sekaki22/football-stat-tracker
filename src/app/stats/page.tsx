import SeasonWrapper from '@/components/SeasonWrapper'
import { SeasonService } from '@/lib/services/seasonService'

export default async function Home() {
  const latestSeason = (await SeasonService.getLatestSeason()) ?? '25/26'
  const players = await SeasonService.getPlayersBySeason(latestSeason)

  return (
    <main className="min-h-screen p-8">
      <SeasonWrapper initialPlayers={players} initialSeason={latestSeason} />
    </main>
  )
}
