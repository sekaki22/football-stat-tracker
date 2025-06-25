'use client'

import { Player } from '@prisma/client'
import { useState } from 'react'

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
  const [goals, setGoals] = useState(player.goals.toString())
  const [assists, setAssists] = useState(player.assists.toString())
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/players/${player.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goals: parseInt(goals),
          assists: parseInt(assists),
          season: currentSeason,
        }),
      })

      if (response.ok) {
        const updatedPlayer = await response.json()
        onSave(updatedPlayer)
        onClose()
      }
    } catch (error) {
      console.error('Error updating player:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Edit {player.name} - Season {currentSeason}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 