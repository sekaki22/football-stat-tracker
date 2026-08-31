'use client'

import { useEffect, useState } from 'react'
import { Player } from '@prisma/client'
import Modal from './Modal'
import {
  getCurrentWeekYear,
  parseSeasonEndYear,
} from '@/lib/weekCalculator'

interface SeasonOnboardingWizardProps {
  isOpen: boolean
  onClose: () => void
  onSeasonCreated: (season: string) => void
  existingSeasons: string[]
}

function getPreviousSeason(seasons: string[]): string | null {
  if (seasons.length === 0) return null
  return [...seasons].sort().at(-1) ?? null
}

function getDefaultPeriodEnd(seasonLabel: string) {
  const endYear = parseSeasonEndYear(seasonLabel)
  return {
    year: endYear ?? getCurrentWeekYear().year + 1,
    week: 21,
  }
}

export default function SeasonOnboardingWizard({
  isOpen,
  onClose,
  onSeasonCreated,
  existingSeasons,
}: SeasonOnboardingWizardProps) {
  const [step, setStep] = useState(1)
  const [season, setSeason] = useState('')
  const [startYear, setStartYear] = useState(getCurrentWeekYear().year)
  const [startWeek, setStartWeek] = useState(getCurrentWeekYear().week)
  const [endYear, setEndYear] = useState(getDefaultPeriodEnd('').year)
  const [endWeek, setEndWeek] = useState(21)
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<number>>(new Set())
  const [newPlayerNames, setNewPlayerNames] = useState<string[]>([])
  const [newPlayerInput, setNewPlayerInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const previousSeason = getPreviousSeason(existingSeasons)

  useEffect(() => {
    if (!isOpen) return

    const current = getCurrentWeekYear()
    setStep(1)
    setSeason('')
    setStartYear(current.year)
    setStartWeek(current.week)
    setEndYear(getDefaultPeriodEnd('').year)
    setEndWeek(21)
    setNewPlayerNames([])
    setNewPlayerInput('')
    setError('')

    async function loadData() {
      try {
        const [allRes, prevRes] = await Promise.all([
          fetch('/api/players'),
          previousSeason
            ? fetch(`/api/players?season=${previousSeason}`)
            : Promise.resolve(null),
        ])

        if (allRes.ok) {
          const players: Player[] = await allRes.json()
          setAllPlayers(players)

          if (prevRes?.ok) {
            const prevPlayers: Player[] = await prevRes.json()
            setSelectedPlayerIds(new Set(prevPlayers.map((p) => p.id)))
          } else {
            setSelectedPlayerIds(new Set(players.map((p) => p.id)))
          }
        }
      } catch {
        setError('Kon spelers niet laden')
      }
    }

    loadData()
  }, [isOpen, previousSeason])

  useEffect(() => {
    const endDefaults = getDefaultPeriodEnd(season)
    setEndYear(endDefaults.year)
    setEndWeek(endDefaults.week)
  }, [season])

  function togglePlayer(id: number) {
    setSelectedPlayerIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function addNewPlayer() {
    const name = newPlayerInput.trim()
    if (!name || newPlayerNames.includes(name)) return
    setNewPlayerNames((prev) => [...prev, name])
    setNewPlayerInput('')
  }

  function removeNewPlayer(name: string) {
    setNewPlayerNames((prev) => prev.filter((n) => n !== name))
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/seasons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          season,
          existingPlayerIds: Array.from(selectedPlayerIds),
          newPlayers: newPlayerNames.map((name) => ({ name })),
          periodStart: { year: startYear, week: startWeek },
          periodEnd: { year: endYear, week: endWeek },
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Kon seizoen niet aanmaken')
      }

      onSeasonCreated(season)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon seizoen niet aanmaken')
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalPlayers = selectedPlayerIds.size + newPlayerNames.length
  const seasonValid = /^\d{2}\/\d{2}$/.test(season)
  const periodValid =
    startYear > 0 &&
    endYear > 0 &&
    startWeek >= 1 &&
    startWeek <= 53 &&
    endWeek >= 1 &&
    endWeek <= 53 &&
    (startYear < endYear || (startYear === endYear && startWeek <= endWeek))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nieuw seizoen aanmaken" size="lg">
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                  step === s
                    ? 'bg-rose-600 text-white'
                    : step > s
                      ? 'bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                {s}
              </span>
              <span className={step === s ? 'font-medium text-gray-900 dark:text-gray-100' : ''}>
                {s === 1 ? 'Seizoen' : 'Spelers'}
              </span>
              {s < 2 && <span className="mx-1 text-gray-300 dark:text-gray-600">→</span>}
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="season" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Seizoen
              </label>
              <input
                id="season"
                type="text"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                placeholder="bijv. 26/27"
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Formaat: YY/YY (bijv. 26/27)
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Start seizoen
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="startWeek" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Week
                  </label>
                  <input
                    id="startWeek"
                    type="number"
                    min={1}
                    max={53}
                    value={startWeek}
                    onChange={(e) => setStartWeek(parseInt(e.target.value, 10) || 1)}
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="startYear" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Jaar
                  </label>
                  <input
                    id="startYear"
                    type="number"
                    min={2020}
                    max={2100}
                    value={startYear}
                    onChange={(e) => setStartYear(parseInt(e.target.value, 10) || getCurrentWeekYear().year)}
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Standaard: huidige week ({getCurrentWeekYear().week}, {getCurrentWeekYear().year})
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Einde seizoen
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="endWeek" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Week
                  </label>
                  <input
                    id="endWeek"
                    type="number"
                    min={1}
                    max={53}
                    value={endWeek}
                    onChange={(e) => setEndWeek(parseInt(e.target.value, 10) || 1)}
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="endYear" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Jaar
                  </label>
                  <input
                    id="endYear"
                    type="number"
                    min={2020}
                    max={2100}
                    value={endYear}
                    onChange={(e) => setEndYear(parseInt(e.target.value, 10) || getCurrentWeekYear().year + 1)}
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Corvee teams worden willekeurig ingedeeld. Weekplanning roteert A → B → C → D → E.
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Selecteer spelers voor dit seizoen. Corvee teams worden automatisch willekeurig verdeeld over teams A t/m E.
            </p>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Bestaande spelers
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {allPlayers.map((player) => (
                  <label
                    key={player.id}
                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlayerIds.has(player.id)}
                      onChange={() => togglePlayer(player.id)}
                      className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                    />
                    {player.nickname ?? player.name}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Nieuwe spelers
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPlayerInput}
                  onChange={(e) => setNewPlayerInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNewPlayer())}
                  placeholder="Naam nieuwe speler"
                  className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={addNewPlayer}
                  className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Toevoegen
                </button>
              </div>
              {newPlayerNames.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {newPlayerNames.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1 rounded-full bg-rose-100 dark:bg-rose-900/40 px-3 py-1 text-sm text-rose-800 dark:text-rose-200"
                    >
                      {name}
                      <button
                        type="button"
                        onClick={() => removeNewPlayer(name)}
                        className="text-rose-600 hover:text-rose-800 dark:text-rose-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {totalPlayers} speler{totalPlayers !== 1 ? 's' : ''} geselecteerd
            </p>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => (step === 1 ? onClose() : setStep(step - 1))}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            {step === 1 ? 'Annuleren' : '← Terug'}
          </button>

          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!seasonValid || !periodValid}
              className="px-4 py-2 text-sm bg-rose-600 text-white rounded-md hover:bg-rose-700 disabled:opacity-50"
            >
              Volgende →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || totalPlayers === 0}
              className="px-4 py-2 text-sm bg-rose-600 text-white rounded-md hover:bg-rose-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Aanmaken...' : 'Seizoen aanmaken'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
