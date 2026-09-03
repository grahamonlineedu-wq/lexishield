const express = require('express');
const router = express.Router();
const { analyzeDocument } = require('../controllers/analyzerController');
const { initializePayment, verifyPayment } = require('../controllers/billingController');
const { analysisLimiter } = require('../middleware/rateLimiter');

// Rate-limited analysis endpoint
router.post('/analyze', analysisLimiter, analyzeDocument);

// Billing routes
router.post('/billing/checkout', initializePayment);
router.get('/billing/verify', verifyPayment);

module.exports = router;

