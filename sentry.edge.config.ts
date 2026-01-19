// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',

  // Filter out rate limit errors (429) from middleware
  beforeSend(event, hint) {
    // Don't send events in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_ENABLE_IN_DEV) {
      return null
    }
    
    // Filter out known non-critical errors
    if (event.exception) {
      const error = hint.originalException
      if (error instanceof Error) {
        // Ignore rate limit errors (these are expected)
        if (error.message.includes('Rate limit') || error.message.includes('429')) {
          return null
        }
      }
    }
    
    return event
  },
});
