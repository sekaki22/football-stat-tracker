'use client'

import { useState, useRef } from 'react'

interface Player {
  id: number
  name: string
  goals: number
  assists: number
}

interface MatchStats {
  [playerId: number]: {
    goals: number
    assists: number
  }
}

interface Message {
  type: 'success' | 'error'
  text: string
}

interface StatFormProps {
  season: string
  onStatsUpdated?: () => void
}

export default function StatForm({ season, onStatsUpdated }: StatFormProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [matchStats, setMatchStats] = useState<MatchStats>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const hasFetched = useRef(false)

  const fetchPlayers = async () => {
    try {
      setIsLoading(true)
      // Use the API endpoint instead of direct service call
      const response = await fetch(`/api/players?season=${season}`, { cache: 'no-store' })
      
      if (!response.ok) {
        throw new Error('Failed to fetch players')
      }
      
      const fetchedPlayers = await response.json()
      setPlayers(fetchedPlayers)
      
      // Initialize match stats with 0 for all players
      const initialStats: MatchStats = {}
      fetchedPlayers.forEach((player: Player) => {
        initialStats[player.id] = { goals: 0, assists: 0 }
      })
      setMatchStats(initialStats)
    } catch (error) {
      console.error('Error fetching players:', error)
      setMessage({ type: 'error', text: 'Failed to load players' })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch players on mount (direct call pattern)
  if (!hasFetched.current) {
    hasFetched.current = true
    fetchPlayers()
  }

  const updatePlayerStat = (playerId: number, statType: 'goals' | 'assists', value: number) => {
    setMatchStats(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [statType]: Math.max(0, value) // Ensure non-negative values
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      // Update each player's stats
      const updates = Object.entries(matchStats).map(([playerId, stats]) => {
        if (stats.goals > 0 || stats.assists > 0) {
          return fetch('/api/match-stats', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              playerId: parseInt(playerId),
              season,
              goals: stats.goals,
              assists: stats.assists
            })
          })
        }
        return Promise.resolve()
      }).filter(Boolean)

      await Promise.all(updates)
      
      setMessage({ type: 'success', text: 'Match statistics saved successfully!' })
      
      // Reset form
      const resetStats: MatchStats = {}
      players.forEach(player => {
        resetStats[player.id] = { goals: 0, assists: 0 }
      })
      setMatchStats(resetStats)
      
      // Call the callback to refresh parent data and close modal
      if (onStatsUpdated) {
        setTimeout(() => {
          onStatsUpdated()
        }, 1000) // Small delay to show success message
      }
      
    } catch (error) {
      console.error('Error saving match stats:', error)
      setMessage({ type: 'error', text: 'Failed to save match statistics' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTotalGoals = () => {
    return Object.values(matchStats).reduce((sum, stats) => sum + stats.goals, 0)
  }

  const getTotalAssists = () => {
    return Object.values(matchStats).reduce((sum, stats) => sum + stats.assists, 0)
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse text-sm">Spelers laden...</div>
      </div>
    )
  }

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      {message && (
        <div className={`mb-3 p-2 rounded text-sm ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {players.map((player) => (
            <div key={player.id} className="border rounded p-3 bg-gray-50 dark:bg-gray-700 border-rose-600">
              <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2 truncate" title={player.name}>
                {player.name}
              </h3>
              
              <div className="space-y-2">
                <div>
                  <label htmlFor={`goals-${player.id}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Goals
                  </label>
                  <input
                    type="number"
                    id={`goals-${player.id}`}
                    min="0"
                    value={matchStats[player.id]?.goals || 0}
                    onChange={(e) => updatePlayerStat(player.id, 'goals', parseInt(e.target.value) || 0)}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
                
                <div>
                  <label htmlFor={`assists-${player.id}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Assists
                  </label>
                  <input
                    type="number"
                    id={`assists-${player.id}`}
                    min="0"
                    value={matchStats[player.id]?.assists || 0}
                    onChange={(e) => updatePlayerStat(player.id, 'assists', parseInt(e.target.value) || 0)}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm">Overzicht</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700 dark:text-blue-300">Totaal Goals: </span>
              <span className="font-semibold">{getTotalGoals()}</span>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">Totaal Assists: </span>
              <span className="font-semibold">{getTotalAssists()}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-rose-600 text-white py-2 px-3 rounded text-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Opslaan...' : 'Statistieken opslaan'}
          </button>
          
          <button
            type="button"
            onClick={() => {
              const resetStats: MatchStats = {}
              players.forEach(player => {
                resetStats[player.id] = { goals: 0, assists: 0 }
              })
              setMatchStats(resetStats)
            }}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  )
}



