/**
 * Configuration centralisée pour les scripts
 */

// Configuration des ports
const PORTS = {
  NEXTJS_DEV: process.env.NEXTJS_PORT || 3000,
  NEXTJS_PROD: process.env.NEXTJS_PORT || 3000
}

// Configuration des URLs
const URLS = {
  API_BASE: `http://localhost:${PORTS.NEXTJS_DEV}`,
  TWITTER_POST: `http://localhost:${PORTS.NEXTJS_DEV}/api/social/twitter/post-scheduled`,
  TWITTER_POST_SCHEDULED: `http://localhost:${PORTS.NEXTJS_DEV}/api/social/twitter/post-scheduled`
}

// Configuration des intervalles
const INTERVALS = {
  SCHEDULER_CHECK: 60 * 1000, // 1 minute
  SCHEDULER_CHECK_FAST: 30 * 1000, // 30 secondes
  SCHEDULER_CHECK_SLOW: 5 * 60 * 1000 // 5 minutes
}

// Configuration des tests
const TEST_CONFIG = {
  TWEET_SUCCESS_RATE: 0.9, // 90% de succès pour les tests simulés
  MAX_TWEET_LENGTH: 280,
  TEST_TWEET_PREFIX: '🧪 Test Podcast Manager'
}

module.exports = {
  PORTS,
  URLS,
  INTERVALS,
  TEST_CONFIG
}
