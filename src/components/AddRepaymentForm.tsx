'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Player {
    id: number
    name: string
}

interface FineType {
    id: number
    fine_type: string
    fine_amount: number
    fine_description: string
}

interface AddFineFormProps {
    players: Player[]
    fineTypes: FineType[]
    onSuccess?: () => void
}

export default function AddFineForm({ players, fineTypes, onSuccess }: AddFineFormProps) {
    const [selectedPlayer, setSelectedPlayer] = useState<number | ''>('')
    const [Amount, setAmount] = useState<number | ''>('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    
    const router = useRouter()


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!selectedPlayer) {
            setMessage({ type: 'error', text: 'Selecteer een speler en een bedrag' })
            return
        }

        setIsSubmitting(true)
        setMessage(null)

        try {
            console.log('📤 Sending fine request...')
            const response = await fetch('/api/fines/repayment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',  // Add credentials for session handling
                body: JSON.stringify({
                    player_id: selectedPlayer,
                    repay_amount: Amount
                }),
            })

            // Log the response status
            console.log('📥 Response status:', response.status)
            
            // Try to get response body even if it's an error
            const responseData = await response.json()
            console.log('📥 Response data:', responseData)

            if (response.ok) {
                setMessage({ type: 'success', text: 'Boete succesvol toegevoegd!' })
                setSelectedPlayer('')
                setAmount('')
                router.refresh() // Refresh the page to show updated data
                
                // Close modal after successful submission
                if (onSuccess) {
                    // Small delay to show success message before closing
                    setTimeout(() => {
                        onSuccess()
                    }, 1000)
                }
            } else {
                setMessage({ type: 'error', text: responseData.error || 'Er is een fout opgetreden' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Er is een fout opgetreden bij het toevoegen van de boete' })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Player Selection */}
            <div>
                <label htmlFor="player" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Speler
                </label>
                <select
                    id="player"
                    value={selectedPlayer}
                    onChange={(e) => setSelectedPlayer(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 text-black dark:text-white"
                    required
                >
                    <option value="">Selecteer een speler...</option>
                    {players.map((player) => (
                        <option key={player.id} value={player.id}>
                            {player.name}
                        </option>
                    ))}
                </select>
            </div>

        

            {/* Repayment Amount */}
            <div>
                <label htmlFor="customAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Aangepast Bedrag (optioneel)
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">€</span>
                    <input
                        type="number"
                        id="customAmount"
                        value={Amount}
                        onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                        placeholder={Amount.toString()}
                        min="0"
                        step="0.01"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 text-black dark:text-white"
                    />
                </div>
            </div>

            {/* Message Display */}
            {message && (
                <div className={`p-4 rounded-md ${
                    message.type === 'success' 
                        ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700' 
                        : 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
                {isSubmitting ? 'Bezig met toevoegen...' : 'Aflossing Toevoegen'}
            </button>
        </form>
    )
}
