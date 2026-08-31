'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import SeasonOnboardingWizard from './SeasonOnboardingWizard'

interface SeasonTabsProps {
  currentSeason: string
  onSeasonChange: (season: string) => void
}

export default function SeasonTabs({ currentSeason, onSeasonChange }: SeasonTabsProps) {
  const { data: session } = useSession()
  const [seasons, setSeasons] = useState<string[]>(['24/25', '25/26'])
  const [showWizard, setShowWizard] = useState(false)

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await fetch('/api/seasons')
        if (response.ok) {
          const availableSeasons = await response.json()
          const allSeasons = [...new Set([...availableSeasons, '24/25', '25/26'])]
          setSeasons(allSeasons.sort())
        }
      } catch (error) {
        console.error('Error fetching seasons:', error)
      }
    }

    fetchSeasons()
  }, [])

  const handleSeasonCreated = (season: string) => {
    setSeasons((prev) => [...new Set([...prev, season])].sort())
    onSeasonChange(season)
  }

  return (
    <>
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
              <button
                onClick={() => setShowWizard(true)}
                className="ml-4 px-3 py-1 text-sm text-rose-400 hover:text-rose-300"
              >
                + Seizoen Toevoegen
              </button>
            )}
          </nav>
        </div>
      </div>

      <SeasonOnboardingWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onSeasonCreated={handleSeasonCreated}
        existingSeasons={seasons}
      />
    </>
  )
}
