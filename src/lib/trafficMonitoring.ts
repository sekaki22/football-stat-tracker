/**
 * Traffic Monitoring with Sentry
 * 
 * Sentry automatically tracks all API routes and page loads via performance monitoring.
 * This utility provides additional helpers for custom traffic tracking.
 * 
 * What Sentry CAN track:
 * - Request volumes (throughput)
 * - Response times
 * - Error rates
 * - API endpoint usage
 * - Page load performance
 * 
 * What Sentry CANNOT do (use Google Analytics or similar):
 * - Unique visitors
 * - User sessions
 * - Page view analytics
 * - User behavior flows
 */

import * as Sentry from '@sentry/nextjs'

/**
 * Track a custom traffic event (page views, user actions, etc.)
 * 
 * Note: Sentry automatically tracks all API routes and page loads.
 * Use this for custom events like button clicks, form submissions, etc.
 * 
 * Usage:
 * ```typescript
 * import { trackEvent } from '@/lib/trafficMonitoring'
 * 
 * trackEvent('fine_added', {
 *   playerId: 123,
 *   amount: 50,
 * })
 * ```
 */
export function trackEvent(
  eventName: string,
  data?: Record<string, any>
) {
  try {
    Sentry.captureMessage(eventName, {
      level: 'info',
      tags: {
        event_type: 'traffic',
        ...data,
      },
      extra: data,
    })
  } catch (error) {
    // Silently fail if Sentry is not initialized
    console.debug('Sentry not available for tracking:', eventName)
  }
}

/**
 * Add custom tags to the current Sentry transaction
 * 
 * Usage in API routes:
 * ```typescript
 * import { addTrafficTags } from '@/lib/trafficMonitoring'
 * 
 * export async function GET(request: NextRequest) {
 *   addTrafficTags({
 *     'api.endpoint': '/api/fines',
 *     'user.role': 'admin',
 *   })
 *   // ... your route logic
 * }
 * ```
 */
export function addTrafficTags(tags: Record<string, string>) {
  try {
    Object.entries(tags).forEach(([key, value]) => {
      Sentry.setTag(key, value)
    })
  } catch (error) {
    // Silently fail if Sentry is not initialized
    console.debug('Sentry not available for tags')
  }
}
