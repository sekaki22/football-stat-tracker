import { NextRequest, NextResponse } from 'next/server'
import { FineService } from '@/lib/services/fineService'
import { withAdminAuth } from '@/lib/middleware'

export async function POST(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const result = await FineService.resetFinePot()

      return NextResponse.json({
        success: true,
        deactivatedCount: result.count,
      })
    } catch (error) {
      console.error('Error resetting fine pot:', error)
      return NextResponse.json(
        { error: 'Failed to reset fine pot' },
        { status: 500 }
      )
    }
  })
}
