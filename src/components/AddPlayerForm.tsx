'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface AddPlayerFormProps {
  onAdded?: () => void
}

export default function AddPlayerForm({ onAdded }: AddPlayerFormProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [goals, setGoals] = useState('0')
  const [assists, setAssists] = useState('0')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          goals: parseInt(goals),
          assists: parseInt(assists),
        }),
      })

      if (response.ok) {
        router.refresh()
        setName('')
        setGoals('0')
        setAssists('0')
        if (onAdded) onAdded()
      }
    } catch (error) {
      console.error('Error adding player:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="space-y-4">
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
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full   bg-rose-500 text-white py-2 px-4 rounded-md hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Toevoegen...' : 'Speler Toevoegen'}
        </button>
      </div>
    </form>
  )
} 