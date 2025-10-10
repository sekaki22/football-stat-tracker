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
        <div className="table-container">
          <table className="table-base min-w-[560px] sm:w-full">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell-primary sticky left-0 z-10 bg-gray-50 dark:bg-gray-900">Player</th>
                <th className="table-header-cell-primary text-right">Goals</th>
                <th className="table-header-cell-primary text-right">Assists</th>
                <th className="table-header-cell-primary text-right">Total</th>
                {session?.user?.isAdmin && (
                  <th className="table-header-cell-primary text-right hidden sm:table-cell">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="table-body">
              {players.map((player, index) => (
                <tr key={player.id} className="table-row">
                  <td className="table-cell sticky left-0 z-0 bg-white dark:bg-gray-800 min-w-[180px]">
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400 mr-3 w-6">
                        #{index + 1}
                      </span>
                      <span className="font-medium">{player.name}</span>
                    </div>
                  </td>
                  <td className="table-cell-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {player.goals}
                    </span>
                  </td>
                  <td className="table-cell-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {player.assists}
                    </span>
                  </td>
                  <td className="table-cell-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                      {player.goals + player.assists}
                    </span>
                  </td>
                  {session?.user?.isAdmin && (
                    <td className="table-cell-right hidden sm:table-cell">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(player)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(player.id)}
                          disabled={deletingId === player.id}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 text-sm font-medium"
                        >
                          {deletingId === player.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {players.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Nog geen spelers toegevoegd voor dit seizoen.
            </p>
          </div>
        )}
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