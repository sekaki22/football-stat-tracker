'use client'

import { useState } from 'react'
import { Player } from '@prisma/client'
import PlayerList from './PlayerList'
import PlayerStats from './PlayerStats'
import AddGoalForm from './AddGoalForm'
import AddPlayerForm from './AddPlayerForm'
import SeasonTabs from './SeasonTabs'
import { useSession } from 'next-auth/react'

interface SeasonWrapperProps {
  initialPlayers: Player[]
}

export default function SeasonWrapper({ initialPlayers }: SeasonWrapperProps) {
  const { data: session } = useSession()
  const [currentSeason, setCurrentSeason] = useState('24/25')
  const [players, setPlayers] = useState(initialPlayers)

  const handleSeasonChange = async (season: string) => {
    setCurrentSeason(season)
    
    try {
      const response = await fetch(`/api/players?season=${season}`)
      if (response.ok) {
        const seasonPlayers = await response.json()
        setPlayers(seasonPlayers)
      }
    } catch (error) {
      console.error('Error fetching season data:', error)
    }
  }

  const handleStatAdded = async () => {
    // Refresh the current season data
    try {
      const response = await fetch(`/api/players?season=${currentSeason}`)
      if (response.ok) {
        const seasonPlayers = await response.json()
        setPlayers(seasonPlayers)
      }
    } catch (error) {
      console.error('Error refreshing season data:', error)
    }
  }

  return (
    <>
      <SeasonTabs currentSeason={currentSeason} onSeasonChange={handleSeasonChange} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Top Scorers</h2>
          <PlayerList 
            players={players} 
            currentSeason={currentSeason}
            onPlayerUpdated={handleStatAdded}
          />
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
            <AddGoalForm 
              players={players} 
              currentSeason={currentSeason}
              onStatAdded={handleStatAdded}
            />
          </div>
        </div>
      )}
    </>
  )
} 