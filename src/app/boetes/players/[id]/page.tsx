import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function PlayerFinesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const playerId = parseInt(id)
    
    if (isNaN(playerId)) {
        notFound()
    }

    let player;
    let fines;
    let totalAmount = 0;

    try {
        // Fetch player details and fines in parallel for better performance
        [player, fines] = await Promise.all([
            // Get player details
            prisma.player.findUnique({
                where: { id: playerId }
            }),
            
            // Get player's fines with fine type information
            prisma.fine.findMany({
                where: { player_id: playerId },
                include: {
                    fineInfo: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })
        ])

        if (!player) {
            notFound()
        }

        totalAmount = fines.reduce((sum, fine) => sum + fine.fine_amount, 0)
    } catch (error) {
        console.error('Error fetching player data:', error)
        throw new Error('Failed to load player data')
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Boetes - {player.name}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Totaal: €{totalAmount} • {fines.length} boetes
                    </p>
                </div>

                {/* Fines List */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="table-container">
                        <table className="table-base">
                            <thead className="table-header">
                                <tr>
                                    <th className="table-header-cell-primary">Datum</th>
                                    <th className="table-header-cell-primary">Overtreding</th>
                                    <th className="table-header-cell-primary">Bedrag</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {fines.map((fine) => (
                                    <tr key={fine.id} className="table-row">
                                        <td className="table-cell-secondary">
                                            {new Date(fine.createdAt).toLocaleDateString('nl-NL')}
                                        </td>
                                        <td className="table-cell">
                                            {fine.fineInfo.fine_type}
                                        </td>
                                        <td className="table-cell">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                €{fine.fine_amount}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {fines.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="table-cell text-center text-gray-500 dark:text-gray-400">
                                            Geen boetes gevonden
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}