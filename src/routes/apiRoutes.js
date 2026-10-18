const express = require('express');
const router = express.Router();
const { analyzeDocument } = require('../controllers/analyzerController');
const { initializePayment, verifyPayment, handleWebhook } = require('../controllers/billingController');
const { analysisLimiter } = require('../middleware/rateLimiter');
const { requireApiKey } = require('../middleware/auth');

// Public route for health checks and provider callback compatibility
router.get('/billing/verify', verifyPayment);

// Webhook - use raw body parser so we can verify signature
router.post('/billing/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.post('/analyze', requireApiKey, analysisLimiter, analyzeDocument);
router.post('/billing/checkout', requireApiKey, initializePayment);

module.exports = router;
