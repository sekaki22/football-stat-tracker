import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function withAuth(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  options: { 
    adminOnly?: boolean
  } = {}
) {
  try {
    // Get session from JWT token
    const session = await getServerSession(authOptions)

    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    // Check admin rights if required
    if (options.adminOnly && !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // If all checks pass, call the handler
    return await handler()
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication Error - Please try signing in again' },
      { status: 500 }
    )
  }
}

// Helper for admin-only routes
export async function withAdminAuth(
  request: NextRequest,
  handler: () => Promise<NextResponse>
) {
  return withAuth(request, handler, { 
    adminOnly: true
  })
}

// Helper for any authenticated user
export async function withUserAuth(
  request: NextRequest,
  handler: () => Promise<NextResponse>
) {
  return withAuth(request, handler, { 
    adminOnly: false
  })
}
