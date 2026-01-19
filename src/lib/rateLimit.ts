/**
 * Rate Limiting Utility
 * 
 * This file provides rate limiting functionality for your API routes.
 * 
 * DEVELOPMENT: Uses in-memory storage (simple but resets on server restart)
 * PRODUCTION: Use Redis-based solution (Upstash Redis recommended for serverless)
 * 
 * Usage in API routes:
 * ```typescript
 * import { rateLimit } from '@/lib/rateLimit'
 * 
 * export async function POST(request: NextRequest) {
 *   const { success } = await rateLimit(request)
 *   if (!success) {
 *     return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
 *   }
 *   // Your route logic here
 * }
 * ```
 */

import { NextRequest } from 'next/server'

// Development: Simple in-memory rate limiter
class InMemoryRateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  
  check(identifier: string, windowMs: number, maxRequests: number) {
    const now = Date.now()
    const record = this.requests.get(identifier)

    if (!record || now > record.resetTime) {
      const resetTime = now + windowMs
      this.requests.set(identifier, { count: 1, resetTime })
      return { allowed: true, remaining: maxRequests - 1, resetTime }
    }

    if (record.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetTime: record.resetTime }
    }

    record.count++
    return { allowed: true, remaining: maxRequests - record.count, resetTime: record.resetTime }
  }

  cleanup() {
    const now = Date.now()
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key)
      }
    }
  }
}

const devLimiter = new InMemoryRateLimiter()
setInterval(() => devLimiter.cleanup(), 5 * 60 * 1000)

/**
 * Get client identifier from request
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers (useful behind proxies/load balancers)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  // In production, you might want to combine IP with user ID if authenticated
  // const session = await getServerSession(authOptions)
  // return session?.user?.id ? `${ip}-${session.user.id}` : ip
  
  return ip
}

/**
 * Rate limit configuration
 */
interface RateLimitOptions {
  windowMs?: number      // Time window in milliseconds (default: 60000 = 1 minute)
  maxRequests?: number  // Maximum requests per window (default: 100)
  identifier?: string   // Custom identifier (default: IP address)
}

/**
 * Rate limit check function
 * 
 * Returns { success: boolean, remaining: number, resetTime: number }
 */
export async function rateLimit(
  request: NextRequest,
  options: RateLimitOptions = {}
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  const {
    windowMs = 60 * 1000,  // 1 minute default
    maxRequests = 100,     // 100 requests per minute default
    identifier
  } = options

  const clientId = identifier || getClientIdentifier(request)

  // DEVELOPMENT: Use in-memory limiter
  if (process.env.NODE_ENV === 'development' || !process.env.UPSTASH_REDIS_REST_URL) {
    const result = devLimiter.check(clientId, windowMs, maxRequests)
    return {
      success: result.allowed,
      remaining: result.remaining,
      resetTime: result.resetTime
    }
  }

  // PRODUCTION: Use Upstash Redis (uncomment when ready)
  /*
  try {
    const { Ratelimit } = await import('@upstash/ratelimit')
    const { Redis } = await import('@upstash/redis')

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })

    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs}ms`),
      analytics: true,
    })

    const result = await ratelimit.limit(clientId)
    return {
      success: result.success,
      remaining: result.remaining,
      resetTime: result.reset || Date.now() + windowMs
    }
  } catch (error) {
    console.error('Rate limit error:', error)
    // Fail open - allow request if rate limiting service is down
    return { success: true, remaining: maxRequests, resetTime: Date.now() + windowMs }
  }
  */

  // Fallback to in-memory if Redis not configured
  const result = devLimiter.check(clientId, windowMs, maxRequests)
  return {
    success: result.allowed,
    remaining: result.remaining,
    resetTime: result.resetTime
  }
}

/**
 * Create a rate-limited API route wrapper
 * 
 * Example usage:
 * ```typescript
 * export const POST = rateLimitedHandler(async (request) => {
 *   // Your route logic
 *   return NextResponse.json({ success: true })
 * }, { maxRequests: 50, windowMs: 60000 })
 * ```
 */
export function rateLimitedHandler(
  handler: (request: NextRequest) => Promise<Response>,
  options: RateLimitOptions = {}
) {
  return async (request: NextRequest) => {
    const limitResult = await rateLimit(request, options)
    
    if (!limitResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((limitResult.resetTime - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': (options.maxRequests || 100).toString(),
            'X-RateLimit-Remaining': limitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(limitResult.resetTime).toISOString(),
            'Retry-After': Math.ceil((limitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    const response = await handler(request)
    
    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', (options.maxRequests || 100).toString())
    response.headers.set('X-RateLimit-Remaining', limitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(limitResult.resetTime).toISOString())
    
    return response
  }
}
