'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface SeasonTabsProps {
  currentSeason: string
  onSeasonChange: (season: string) => void
}

export default function SeasonTabs({ currentSeason, onSeasonChange }: SeasonTabsProps) {
  const { data: session } = useSession()
  const [seasons, setSeasons] = useState<string[]>(['24/25', '25/26'])
  const [showAddSeason, setShowAddSeason] = useState(false)
  const [newSeason, setNewSeason] = useState('')

  useEffect(() => {
    // Fetch available seasons from the API
    const fetchSeasons = async () => {
      try {
        const response = await fetch('/api/seasons')
        if (response.ok) {
          const availableSeasons = await response.json()
          // Always include the default seasons if they don't exist yet
          const allSeasons = [...new Set([...availableSeasons, '24/25', '25/26'])]
          setSeasons(allSeasons.sort())
        }
      } catch (error) {
        console.error('Error fetching seasons:', error)
      }
    }

    fetchSeasons()
  }, [])

  const handleAddSeason = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSeason.trim()) return

    try {
      const response = await fetch('/api/seasons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ season: newSeason }),
      })

      if (response.ok) {
        setSeasons(prev => [...prev, newSeason].sort())
        setNewSeason('')
        setShowAddSeason(false)
      }
    } catch (error) {
      console.error('Error adding season:', error)
    }
  }

  return (
    <div className="mb-6">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 items-center" aria-label="Tabs">
          {seasons.map((season) => (
            <button
              key={season}
              onClick={() => onSeasonChange(season)}
              className={`
                whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm
                ${
                  currentSeason === season
                    ? 'border-rose-500 text-rose-400'
                    : 'border-transparent text-gray-400 hover:text-rose-300 hover:border-rose-500'
                }
              `}
            >
              Seizoen {season}
            </button>
          ))}
          
          {session?.user?.isAdmin && (
            <div className="ml-4">
              {showAddSeason ? (
                <form onSubmit={handleAddSeason} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newSeason}
                    onChange={(e) => setNewSeason(e.target.value)}
                    placeholder="e.g., 26/27"
                    className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 text-sm bg-rose-600 text-white rounded hover:bg-rose-700"
                  >
                    Toevoegen
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddSeason(false)
                      setNewSeason('')
                    }}
                    className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowAddSeason(true)}
                  className="px-3 py-1 text-sm text-rose-400 hover:text-rose-300"
                >
                  + Seizoen Toevoegen
                </button>
              )}
            </div>
          )}
        </nav>
      </div>
    </div>
  )
} 