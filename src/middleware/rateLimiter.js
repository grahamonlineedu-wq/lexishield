const rateLimit = require('express-rate-limit');

// Limits each IP to 5 document analysis requests per hour on the free tier
exports.analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5,
  message: {
    error: 'Free tier limit reached (5 scans/hour). Upgrade to LexiShield Pro for unlimited contract audits.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

