'use client'

import { Player } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import EditPlayerDialog from './EditPlayerDialog'
import { useSession } from 'next-auth/react'

interface PlayerListProps {
  players: Player[]
  currentSeason: string
  onPlayerUpdated?: () => void
}

export default function PlayerList({ players, currentSeason, onPlayerUpdated }: PlayerListProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [showAddGoal, setShowAddGoal] = useState(false)

  async function handleDelete(playerId: number) {
    setDeletingId(playerId)
    try {
      const response = await fetch(`/api/players/${playerId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error deleting player:', error)
    } finally {
      setDeletingId(null)
    }
  }

  function handleEdit(player: Player) {
    setEditingPlayer(player)
  }

  function handleSave() {
    if (onPlayerUpdated) {
      onPlayerUpdated()
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="text-left py-2 text-gray-900 dark:text-gray-100">Player</th>
              <th className="text-right py-2 text-gray-900 dark:text-gray-100">Goals</th>
              <th className="text-right py-2 text-gray-900 dark:text-gray-100">Assists</th>
              {session?.user?.isAdmin && (
                <th className="text-right py-2 text-gray-900 dark:text-gray-100">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id} className="border-b dark:border-gray-700">
                <td className="py-2 text-gray-900 dark:text-gray-100">{player.name}</td>
                <td className="text-right py-2 text-gray-900 dark:text-gray-100">{player.goals}</td>
                <td className="text-right py-2 text-gray-900 dark:text-gray-100">{player.assists}</td>
                {session?.user?.isAdmin && (
                  <td className="text-right py-2 space-x-2">
                    <button
                      onClick={() => handleEdit(player)}
                      className="text-rose-400 hover:text-rose-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(player.id)}
                      disabled={deletingId === player.id}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                    >
                      {deletingId === player.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingPlayer && (
        <EditPlayerDialog
          player={editingPlayer}
          currentSeason={currentSeason}
          isOpen={true}
          onClose={() => setEditingPlayer(null)}
          onSave={handleSave}
        />
      )}
    </>
  )
} 