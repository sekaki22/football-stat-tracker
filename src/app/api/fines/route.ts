import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all fines with related data
export async function GET(request: NextRequest) {
        try {
            const fines = await prisma.fine.findMany({
                include: {
                    player: true,
                    fineInfo: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })

            return NextResponse.json(fines)
        } catch (error) {
            console.error('Error fetching fines:', error)
            return NextResponse.json(
                { error: 'Failed to fetch fines' },
                { status: 500 }
            )
        }
    
}

// POST - Add a new fine (admin only)
export async function POST(request: NextRequest) {
        try {
            const body = await request.json()
            const { player_id, fine_type_id, fine_amount } = body

            // Validate required fields
            if (!player_id || !fine_type_id) {
                return NextResponse.json(
                    { error: 'Player ID and Fine Type ID are required' },
                    { status: 400 }
                )
            }

            // Verify that the player exists
            const player = await prisma.player.findUnique({
                where: { id: player_id }
            })

            if (!player) {
                return NextResponse.json(
                    { error: 'Player not found' },
                    { status: 404 }
                )
            }

            // Verify that the fine type exists
            const fineType = await prisma.fineInformation.findUnique({
                where: { id: fine_type_id }
            })

            if (!fineType) {
                return NextResponse.json(
                    { error: 'Fine type not found' },
                    { status: 404 }
                )
            }

            // Use provided amount or default from fine type
            const finalAmount = fine_amount || fineType.fine_amount

            // Create the fine
            const newFine = await prisma.fine.create({
                data: {
                    player_id: player_id,
                    fine_type_id: fine_type_id,
                    fine_amount: finalAmount
                },
                include: {
                    player: true,
                    fineInfo: true
                }
            })

            return NextResponse.json(newFine, { status: 201 })
        } catch (error) {
            console.error('Error creating fine:', error)
            return NextResponse.json(
                { error: 'Failed to create fine' },
                { status: 500 }
            )
        }
    
}

// DELETE - Remove a fine (admin only)
export async function DELETE(request: NextRequest) {
        try {
            const { searchParams } = new URL(request.url)
            const fineId = searchParams.get('id')

            if (!fineId) {
                return NextResponse.json(
                    { error: 'Fine ID is required' },
                    { status: 400 }
                )
            }

            // Check if fine exists
            const fine = await prisma.fine.findUnique({
                where: { id: parseInt(fineId) }
            })

            if (!fine) {
                return NextResponse.json(
                    { error: 'Fine not found' },
                    { status: 404 }
                )
            }

            // Delete the fine
            await prisma.fine.delete({
                where: { id: parseInt(fineId) }
            })

            return NextResponse.json(
                { message: 'Fine deleted successfully' },
                { status: 200 }
            )
        } catch (error) {
            console.error('Error deleting fine:', error)
            return NextResponse.json(
                { error: 'Failed to delete fine' },
                { status: 500 }
            )
        }
    
}