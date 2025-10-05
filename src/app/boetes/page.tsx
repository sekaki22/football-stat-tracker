import { prisma } from "@/lib/prisma"
import AdminFineSection from "@/components/AdminFineSection"

export default async function BoetesPage() {
    // Fetch all fines with related data
    const fines = await prisma.fine.findMany({
        include: {
            player: true,
            fineInfo: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    // Always fetch players and fine types for the client component to handle
    const players = await prisma.player.findMany({
        orderBy: {
            name: 'asc'
        }
    })

    const fineTypes = await prisma.fineInformation.findMany({
        orderBy: {
            fine_type: 'asc'
        }
    })

    // Calculate total fines amount
    const totalFinesAmount = fines.reduce((sum, fine) => sum + fine.fine_amount, 0)

    // Calculate fines per player
    const finesPerPlayer = fines.reduce((acc, fine) => {
        const playerId = fine.player_id
        if (!acc[playerId]) {
            acc[playerId] = {
                player: fine.player,
                totalAmount: 0,
                fineCount: 0,
                fines: []
            }
        }
        acc[playerId].totalAmount += fine.fine_amount
        acc[playerId].fineCount += 1
        acc[playerId].fines.push(fine)
        return acc
    }, {} as Record<number, {
        player: any,
        totalAmount: number,
        fineCount: number,
        fines: any[]
    }>)

    const playersWithFines = Object.values(finesPerPlayer).sort((a, b) => b.totalAmount - a.totalAmount)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Boetes Beheer
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Beheer en overzicht van alle boetes
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-3 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                                €{totalFinesAmount}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Totaal Boetebedrag
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {fines.length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Aantal Boetes
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {playersWithFines.length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Spelers met Boetes
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Add Fine Form - Admin Only */}
                    <AdminFineSection players={players} fineTypes={fineTypes} />

                    {/* Top Offenders */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                            Top Overtreders
                        </h2>
                        <div className="space-y-4">
                            {playersWithFines.slice(0, 5).map((playerData, index) => (
                                <div key={playerData.player.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-white text-sm font-bold">#{index + 1}</span>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-gray-100">
                                                {playerData.player.name}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {playerData.fineCount} boetes
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-red-600 dark:text-red-400">
                                            €{playerData.totalAmount}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {playersWithFines.length === 0 && (
                                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    Nog geen boetes uitgedeeld
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* All Fines per Player */}
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                        Boetes per Speler
                    </h2>
                    
                    <div className="table-container">
                        <table className="table-base">
                            <thead className="table-header">
                                <tr>
                                    <th className="table-header-cell-primary">Speler</th>
                                    <th className="table-header-cell-primary">Aantal Boetes</th>
                                    <th className="table-header-cell-primary">Totaal Bedrag</th>
                                    <th className="table-header-cell-primary">Laatste Boete</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {playersWithFines.map((playerData) => {
                                    const latestFine = playerData.fines.sort((a, b) => 
                                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                                    )[0]
                                    
                                    return (
                                        <tr key={playerData.player.id} className="table-row">
                                            <td className="table-cell">
                                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                                    {playerData.player.name}
                                                </div>
                                            </td>
                                            <td className="table-cell">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                    {playerData.fineCount}
                                                </span>
                                            </td>
                                            <td className="table-cell">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                    €{playerData.totalAmount}
                                                </span>
                                            </td>
                                            <td className="table-cell-secondary">
                                                {latestFine ? (
                                                    <div className="text-sm">
                                                        <div>{latestFine.fineInfo.fine_type}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {new Date(latestFine.createdAt).toLocaleDateString('nl-NL')}
                                                        </div>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Fines */}
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                        Recente Boetes
                    </h2>
                    
                    <div className="table-container">
                        <table className="table-base">
                            <thead className="table-header">
                                <tr>
                                    <th className="table-header-cell-primary">Datum</th>
                                    <th className="table-header-cell-primary">Speler</th>
                                    <th className="table-header-cell-primary">Overtreding</th>
                                    <th className="table-header-cell-primary">Bedrag</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {fines.slice(0, 10).map((fine) => (
                                    <tr key={fine.id} className="table-row">
                                        <td className="table-cell-secondary">
                                            {new Date(fine.createdAt).toLocaleDateString('nl-NL')}
                                        </td>
                                        <td className="table-cell">
                                            {fine.player.name}
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
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
