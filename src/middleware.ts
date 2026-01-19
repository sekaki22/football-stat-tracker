import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'

// Simple in-memory rate limiter for development
// For production, use Redis-based solution (see rateLimit.ts)
class SimpleRateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  private windowMs: number
  private maxRequests: number

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const record = this.requests.get(identifier)

    if (!record || now > record.resetTime) {
      // Create new window
      const resetTime = now + this.windowMs
      this.requests.set(identifier, { count: 1, resetTime })
      return { allowed: true, remaining: this.maxRequests - 1, resetTime }
    }

    if (record.count >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: record.resetTime }
    }

    record.count++
    return { allowed: true, remaining: this.maxRequests - record.count, resetTime: record.resetTime }
  }

  // Clean up old entries periodically
  cleanup() {
    const now = Date.now()
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key)
      }
    }
  }
}

// Initialize rate limiters
// API routes: 100 requests per minute per IP
const apiLimiter = new SimpleRateLimiter(60 * 1000, 100)
// General routes: 200 requests per minute per IP
const generalLimiter = new SimpleRateLimiter(60 * 1000, 200)

// Cleanup every 5 minutes (if setInterval is available in Edge Runtime)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    apiLimiter.cleanup()
    generalLimiter.cleanup()
  }, 5 * 60 * 1000)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip rate limiting for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/logo.jpeg') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    return NextResponse.next()
  }

  // Get client identifier (IP address)
  // NextRequest doesn't have .ip property, so we get it from headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfIp = request.headers.get('cf-connecting-ip')
  
  const ip = forwardedFor?.split(',')[0]?.trim() || 
             realIp || 
             cfIp || 
             'localhost' // Use 'localhost' for local dev

  // Apply different limits for API routes vs general routes
  const isApiRoute = pathname.startsWith('/api')
  const limiter = isApiRoute ? apiLimiter : generalLimiter
  const limit = isApiRoute ? 100 : 200

  const result = limiter.check(ip)

  // If rate limit exceeded, return 429
  if (!result.allowed) {
    const rateLimitResponse = NextResponse.json(
      { 
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
      },
      { status: 429 }
    )

    // Add rate limit headers
    rateLimitResponse.headers.set('X-RateLimit-Limit', limit.toString())
    rateLimitResponse.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    rateLimitResponse.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString())
    rateLimitResponse.headers.set('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000).toString())

    return rateLimitResponse
  }

  // Track traffic in Sentry (for monitoring)
  // Sentry automatically tracks all requests via performance monitoring,
  // but we can add custom tags for better filtering
  try {
    Sentry.setTag('route.path', pathname)
    Sentry.setTag('route.type', isApiRoute ? 'api' : 'page')
    Sentry.setTag('rate_limit.remaining', result.remaining.toString())
    
    // Track request metadata
    Sentry.setContext('request', {
      path: pathname,
      method: request.method,
      ip: ip,
      isApiRoute,
      rateLimitRemaining: result.remaining,
    })
  } catch (error) {
    // Silently fail if Sentry is not initialized (e.g., in dev)
    // This prevents middleware from breaking if Sentry fails
  }

  // Add rate limit info headers
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString())

  return response
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
