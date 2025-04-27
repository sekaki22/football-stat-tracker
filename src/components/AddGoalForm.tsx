'use client'

import { Player } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import GoalMemeModal from './GoalMemeModal'

interface AddGoalFormProps {
  players: Player[]
}

export default function AddGoalForm({ players }: AddGoalFormProps) {
  const router = useRouter()
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [statType, setStatType] = useState<'goal' | 'assist'>('goal')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMeme, setShowMeme] = useState(false)
  const [scoringPlayer, setScoringPlayer] = useState<Player | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPlayer) return

    setIsSubmitting(true)
    try {
      const endpoint = statType === 'goal' ? '/api/goals' : '/api/assists'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId: selectedPlayer }),
      })

      if (response.ok) {
        router.refresh()
        setSelectedPlayer('')
        
        // Show meme if it's a goal
        if (statType === 'goal') {
          const player = players.find(p => p.id === parseInt(selectedPlayer))
          if (player) {
            setScoringPlayer(player)
            setShowMeme(true)
          }
        }
      }
    } catch (error) {
      console.error('Error adding stat:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="player" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Player
            </label>
            <select
              id="player"
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Choose a player</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="statType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Stat Type
            </label>
            <select
              id="statType"
              value={statType}
              onChange={(e) => setStatType(e.target.value as 'goal' | 'assist')}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="goal">Goal</option>
              <option value="assist">Assist</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : `Add ${statType === 'goal' ? 'Goal' : 'Assist'}`}
          </button>
        </div>
      </form>

      {scoringPlayer && (
        <GoalMemeModal
          player={scoringPlayer}
          isOpen={showMeme}
          onClose={() => {
            setShowMeme(false)
            setScoringPlayer(null)
          }}
        />
      )}
    </>
  )
} 