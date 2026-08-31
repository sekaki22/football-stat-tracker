'use client'

import { Player } from '@prisma/client'
import { useState } from 'react'
import Modal from './Modal'

interface EditPlayerDialogProps {
  player: Player
  currentSeason: string
  isOpen: boolean
  onClose: () => void
  onSave: (player: Player) => void
}

export default function EditPlayerDialog({
  player,
  currentSeason,
  isOpen,
  onClose,
  onSave,
}: EditPlayerDialogProps) {
  const [name, setName] = useState(player.name)
  const [nickname, setNickname] = useState(player.nickname ?? '')
  const [goals, setGoals] = useState(player.goals.toString())
  const [assists, setAssists] = useState(player.assists.toString())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/players/${player.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          nickname: nickname.trim() || null,
          goals: parseInt(goals),
          assists: parseInt(assists),
          season: currentSeason,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Kon speler niet bijwerken')
      }

      const updatedPlayer = await response.json()
      onSave(updatedPlayer)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon speler niet bijwerken')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Speler bewerken — ${currentSeason}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Naam
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm"
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
            placeholder={name || 'Wordt gebruikt in corvee planning'}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Laat leeg om de naam te gebruiken in corvee planning.
          </p>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Statistieken ({currentSeason})
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="goals" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Goals
              </label>
              <input
                type="number"
                id="goals"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                min="0"
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="assists" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Assists
              </label>
              <input
                type="number"
                id="assists"
                value={assists}
                onChange={(e) => setAssists(e.target.value)}
                min="0"
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Annuleren
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-rose-600 text-white rounded-md hover:bg-rose-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Opslaan...' : 'Opslaan'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
