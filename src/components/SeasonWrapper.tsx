'use client'

import { useEffect, useState } from 'react'
import { Player } from '@prisma/client'
import PlayerList from './PlayerList'
import PlayerStats from './PlayerStats'
import AddGoalForm from './AddGoalForm'
import AddPlayerForm from './AddPlayerForm'
import StatForm from './StatForm'
import SeasonTabs from './SeasonTabs'
import Modal from './Modal'
import { useSession } from 'next-auth/react'

interface SeasonWrapperProps {
  initialPlayers: Player[]
}

export default function SeasonWrapper({ initialPlayers }: SeasonWrapperProps) {
  const { data: session } = useSession()
  const [currentSeason, setCurrentSeason] = useState('25/26')
  const [players, setPlayers] = useState(initialPlayers)
  
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false)
  const [showAddGoalModal, setShowAddGoalModal] = useState(false)
  const [showMatchStatsModal, setShowMatchStatsModal] = useState(false)

  const handleSeasonChange = async (season: string) => {
    setCurrentSeason(season)
    
    try {
      const response = await fetch(`/api/players?season=${season}`, { cache: 'no-store' })
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
      const response = await fetch(`/api/players?season=${currentSeason}`, { cache: 'no-store' })
      if (response.ok) {
        const seasonPlayers = await response.json()
        setPlayers(seasonPlayers)
      }
    } catch (error) {
      console.error('Error refreshing season data:', error)
    }
  }

  // Fetch players for the default season on initial mount
  useEffect(() => {
    // Ensure the first render reflects the selected default season
    handleSeasonChange(currentSeason)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <SeasonTabs currentSeason={currentSeason} onSeasonChange={handleSeasonChange} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Spelerslijst</h2>
          <PlayerList 
            players={players} 
            currentSeason={currentSeason}
            onPlayerUpdated={handleStatAdded}
          />
          {session?.user?.isAdmin && (
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => setShowAddPlayerModal(true)}
                className="px-4 py-2 rounded-md bg-rose-600 text-white hover:bg-rose-700"
              >
                Speler toevoegen
              </button>
              <button
                onClick={() => setShowAddGoalModal(true)}
                className="px-4 py-2 rounded-md bg-green-400 text-white hover:bg-green-500"
              >
                Goal/Assist toevoegen
              </button>
              <button
                onClick={() => setShowMatchStatsModal(true)}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Wedstrijd invoeren
              </button>
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Statistieken</h2>
          <PlayerStats players={players} />
        </div>
      </div>

      <Modal
        isOpen={showAddPlayerModal}
        onClose={() => setShowAddPlayerModal(false)}
        title="Speler toevoegen"
      >
        <AddPlayerForm onAdded={() => setShowAddPlayerModal(false)} />
      </Modal>

      <Modal
        isOpen={showAddGoalModal}
        onClose={() => setShowAddGoalModal(false)}
        title="Goal/Assist toevoegen"
      >
        <AddGoalForm
          players={players}
          currentSeason={currentSeason}
          onStatAdded={handleStatAdded}
          onAdded={() => setShowAddGoalModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showMatchStatsModal}
        onClose={() => setShowMatchStatsModal(false)}
        title={`Wedstrijd statistieken - ${currentSeason}`}
        size="full"
      >
        <StatForm 
          season={currentSeason}
          onStatsUpdated={() => {
            handleStatAdded()
            setShowMatchStatsModal(false)
          }}
        />
      </Modal>
    </>
  )
} 