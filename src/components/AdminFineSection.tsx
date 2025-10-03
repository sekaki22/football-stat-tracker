'use client'

import { useSession } from 'next-auth/react'
import AddFineForm from './AddFineForm'

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

interface AdminFineSectionProps {
    players: Player[]
    fineTypes: FineType[]
}

export default function AdminFineSection({ players, fineTypes }: AdminFineSectionProps) {
    const { data: session, status } = useSession()
    
    if (status === 'loading') {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    Nieuwe Boete Toevoegen
                </h2>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Laden...</p>
                </div>
            </div>
        )
    }

    const isAdmin = session?.user?.isAdmin === true

    if (!session) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    Inloggen Vereist
                </h2>
                <div className="text-center py-8">
                    <div className="text-6xl mb-4">🔐</div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Log in om boetes te beheren.
                    </p>
                </div>
            </div>
        )
    }

    if (!isAdmin) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    Admin Toegang Vereist
                </h2>
                <div className="text-center py-8">
                    <div className="text-6xl mb-4">🔒</div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Alleen administrators kunnen boetes toevoegen.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                        Ingelogd als: {session.user.email}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Nieuwe Boete Toevoegen
            </h2>
            <AddFineForm players={players} fineTypes={fineTypes} />
        </div>
    )
}
