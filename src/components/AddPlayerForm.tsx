'use client'

import { Player } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface AddPlayerFormProps {
  onAdded?: () => void
  season?: string
}

type Mode = 'existing' | 'new'

export default function AddPlayerForm({ onAdded, season }: AddPlayerFormProps) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('existing')
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([])
  const [selectedPlayerId, setSelectedPlayerId] = useState('')
  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [goals, setGoals] = useState('0')
  const [assists, setAssists] = useState('0')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!season) {
      setAvailablePlayers([])
      setMode('new')
      return
    }

    async function loadAvailablePlayers() {
      setIsLoadingPlayers(true)
      setError('')
      try {
        const [allRes, seasonRes] = await Promise.all([
          fetch('/api/players'),
          fetch(`/api/players?season=${encodeURIComponent(season!)}`),
        ])

        if (!allRes.ok || !seasonRes.ok) {
          throw new Error('Kon spelers niet laden')
        }

        const allPlayers: Player[] = await allRes.json()
        const seasonPlayers: Player[] = await seasonRes.json()
        const seasonIds = new Set(seasonPlayers.map((p) => p.id))
        const available = allPlayers
          .filter((p) => !seasonIds.has(p.id))
          .sort((a, b) => (a.nickname ?? a.name).localeCompare(b.nickname ?? b.name))

        setAvailablePlayers(available)
        setSelectedPlayerId('')
        setMode(available.length > 0 ? 'existing' : 'new')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Kon spelers niet laden')
      } finally {
        setIsLoadingPlayers(false)
      }
    }

    loadAvailablePlayers()
  }, [season])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const body =
        mode === 'existing'
          ? {
              playerId: parseInt(selectedPlayerId, 10),
              season,
            }
          : {
              name,
              nickname: nickname.trim() || null,
              goals: parseInt(goals, 10),
              assists: parseInt(assists, 10),
              season,
            }

      if (mode === 'existing' && !selectedPlayerId) {
        setError('Selecteer een speler')
        return
      }
      if (mode === 'new' && !name.trim()) {
        setError('Naam is verplicht')
        return
      }

      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Kon speler niet toevoegen')
      }

      router.refresh()
      setName('')
      setNickname('')
      setGoals('0')
      setAssists('0')
      setSelectedPlayerId('')
      if (onAdded) onAdded()
    } catch (err) {
      console.error('Error adding player:', err)
      setError(err instanceof Error ? err.message : 'Kon speler niet toevoegen')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="space-y-4">
        {season && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('existing')}
              disabled={availablePlayers.length === 0 && !isLoadingPlayers}
              className={`flex-1 px-3 py-2 text-sm rounded-md ${
                mode === 'existing'
                  ? 'bg-rose-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              } disabled:opacity-50`}
            >
              Bestaande speler
            </button>
            <button
              type="button"
              onClick={() => setMode('new')}
              className={`flex-1 px-3 py-2 text-sm rounded-md ${
                mode === 'new'
                  ? 'bg-rose-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Nieuwe speler
            </button>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {mode === 'existing' && season ? (
          <div>
            <label
              htmlFor="existingPlayer"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Speler
            </label>
            {isLoadingPlayers ? (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Spelers laden...</p>
            ) : availablePlayers.length === 0 ? (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Alle bestaande spelers zitten al in dit seizoen.
              </p>
            ) : (
              <select
                id="existingPlayer"
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Kies een speler...</option>
                {availablePlayers.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.nickname ? `${player.name} (${player.nickname})` : player.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Naam Speler
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bijnaam (optioneel)
              </label>
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Wordt gebruikt in corvee planning"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="goals" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Initieel Aantal Doelpunten
              </label>
              <input
                type="number"
                id="goals"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="assists" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Initieel Aantal Assists
              </label>
              <input
                type="number"
                id="assists"
                value={assists}
                onChange={(e) => setAssists(e.target.value)}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={
            isSubmitting ||
            (mode === 'existing' && (isLoadingPlayers || availablePlayers.length === 0))
          }
          className="w-full bg-rose-500 text-white py-2 px-4 rounded-md hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Toevoegen...' : 'Speler Toevoegen'}
        </button>
      </div>
    </form>
  )
}
