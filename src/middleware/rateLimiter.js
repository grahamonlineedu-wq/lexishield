const rateLimit = require('express-rate-limit');

exports.analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    error: 'Free tier limit reached (5 scans/hour). Upgrade to LexiShield Pro for unlimited contract audits.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});
