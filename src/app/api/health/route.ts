import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Health check endpoint
// Returns 200 if app and database are healthy
export async function GET() {
  try {
    // Quick database connectivity check
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json(
      { 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { 
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
}
