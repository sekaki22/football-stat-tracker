import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withUserAuth, withAdminAuth } from '@/lib/middleware'

// POST - Add a repayment record (admin only)
export async function POST(request: NextRequest) {
    return withAdminAuth(request, async () => {
        try {
            const body = await request.json()
            const { player_id, repay_amount } = body

            // Validate required fields
            if (!player_id || !repay_amount) {
                return NextResponse.json(
                    { error: 'Player ID and amount are required' },
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

            // Find or create a "Repayment" fine type
            let repaymentFineType = await prisma.fineInformation.findUnique({
                where: { fine_type: 'Aflossing' }
            })

            if (!repaymentFineType) {
                repaymentFineType = await prisma.fineInformation.create({
                    data: {
                        fine_type: 'Aflossing',
                        fine_amount: 0,
                        fine_description: 'Aflossing van boetes'
                    }
                })
            }

            // Create a new repayment record
            const newRepayment = await prisma.fine.create({
                data: {
                    player_id: player_id,
                    fine_type_id: repaymentFineType.id,
                    fine_amount: 0,
                    fine_amount_repaid: repay_amount
                },
                include: {
                    player: true,
                    fineInfo: true
                }
            })

            return NextResponse.json(newRepayment, { status: 201 })
        } catch (error) {
            console.error('Error creating repayment:', error)
            return NextResponse.json(
                { error: 'Failed to create repayment' },
                { status: 500 }
            )
        }
    })
}