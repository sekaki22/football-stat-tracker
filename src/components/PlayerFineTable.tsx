'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface PlayerFineTableProps {
    playersWithFines: {
        player: any
        totalAmount: number
        totalRepaid: number
        fineCount: number
        fines: any[]
    }[]
}

export default function PlayerFineTable({ playersWithFines }: PlayerFineTableProps) {       
    const [sortedPlayersWithFines, setSortedPlayersWithFines] = useState(playersWithFines)
    const [sortColumn, setSortColumn] = useState('name')
    const [sortDirection, setSortDirection] = useState('asc')

    const handleSort = (column: string) => {
        const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc'
        setSortColumn(column)
        setSortDirection(newDirection)
        setSortedPlayersWithFines(playersWithFines.sort((a, b) => {
            switch (column + newDirection) {
                case 'nameasc':   
                    return a.player.name.localeCompare(b.player.name)
                case 'namedesc':
                    return b.player.name.localeCompare(a.player.name)
                case 'fineCountasc':
                    return a.fineCount - b.fineCount
                case 'fineCountdesc':
                    return b.fineCount - a.fineCount
                case 'totalAmountasc':
                    return a.totalAmount - b.totalAmount
                case 'totalAmountdesc':
                    return b.totalAmount - a.totalAmount
                case 'totalRepaidasc':
                    return a.totalRepaid - b.totalRepaid
                case 'totalRepaiddesc':
                    return b.totalRepaid - a.totalRepaid
                case 'totalAmount - totalRepaidasc':
                    return (a.totalAmount - a.totalRepaid) - (b.totalAmount - b.totalRepaid)
                case 'totalAmount - totalRepaiddesc':
                    return (b.totalAmount - b.totalRepaid) - (a.totalAmount - a.totalRepaid)
                case 'latestFineasc':
                    return new Date(b.fines[0].createdAt).getTime() - new Date(a.fines[0].createdAt).getTime()
                default:
                    return 0
            }
        
        }))
    }

    useEffect(() => {
        setSortedPlayersWithFines(playersWithFines.sort((a, b) => {
            if (sortColumn === 'name') {
                return a.player.name.localeCompare(b.player.name)
            }
            return 0
        }))
    }, [sortColumn, sortDirection, playersWithFines])

    const getSortIcon = (column: string) => {
        if (sortColumn !== column) return '↕'
        return sortDirection === 'asc' ? '↑' : '↓'
    }

return (
<div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
    Boetes per Speler
</h2>

<div className="table-container">
    <table className="table-base">
        <thead className="table-header">
            <tr>
                <th className="table-header-cell-primary cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => handleSort('name')}>
                    Speler {getSortIcon('name')}
                </th>
                <th className="table-header-cell-primary cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => handleSort('fineCount')}>
                    Aantal Boetes {getSortIcon('fineCount')}
                </th>
                <th className="table-header-cell-primary cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => handleSort('totalAmount')}>
                    Totaal Bedrag {getSortIcon('totalAmount')}
                </th>
                <th className="table-header-cell-primary cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => handleSort('totalRepaid')}>
                    Afgelost bedrag {getSortIcon('totalRepaid')}
                </th>
                <th className="table-header-cell-primary cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => handleSort('totalAmount - totalRepaid')}>
                    Openstaand bedrag {getSortIcon('totalAmount - totalRepaid')}
                </th>
                <th className="table-header-cell-primary cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => handleSort('latestFine')}>
                    Laatste Boete {getSortIcon('latestFine')}
                </th>
            </tr>
        </thead>
        <tbody className="table-body">
            {sortedPlayersWithFines.map((playerData) => {
                const latestFine = playerData.fines.sort((a, b) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )[0]
                
                return (
                    <tr key={playerData.player.id} className="table-row">
                        <td className="table-cell">
                            <Link
                                href={`/boetes/players/${playerData.player.id}`}
                                className="font-medium text-gray-900 dark:text-gray-100 hover:text-rose-500 dark:hover:text-rose-400"
                            >
                                {playerData.player.name}
                            </Link>
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
                        <td className="table-cell">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                €{playerData.totalRepaid}
                            </span>
                        </td>
                        <td className="table-cell">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                €{playerData.totalAmount - playerData.totalRepaid}
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
)
}