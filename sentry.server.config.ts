// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  // Higher sample rate = more traffic data visibility, but costs more
  // 0.1 = 10% of requests tracked (good for production)
  // 1.0 = 100% of requests tracked (good for development)
  // Tracing is automatically enabled when tracesSampleRate > 0
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Track more detailed information about requests
  sendDefaultPii: true, // Include IP addresses (anonymized)

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',

  // Filter out health check and monitoring endpoints from error tracking
  beforeSend(event, hint) {
    // Don't send events in development unless explicitly enabled
    // if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_ENABLE_IN_DEV) {
    //   return null
    // }
    
    
    return event
  },
});
