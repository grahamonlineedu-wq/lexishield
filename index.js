const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { analyzeDocument } = require('./src/controllers/analyzerController');
const paymentRoutes = require('./src/routes/payment');
const initDb = require('./src/config/initDb');

const app = express();

// 1. Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // needed for inline styles in SPA
    },
  },
}));

// 2. Body parsing with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Rate limiting - protect /analyze endpoint
const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window per IP
  message: { error: 'Too many analysis requests, try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 4. Static frontend
app.use(express.static(path.join(__dirname, 'public')));

// 5. Health check for Render/Railway/Heroku
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'lexishield',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 6. API Routes
app.use('/api/v1/payment', paymentRoutes);
app.post('/api/v1/analyze', analyzeLimiter, analyzeDocument);

// 7. SPA Fallback: Send all other requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 8. Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`LexiShield v${process.env.npm_package_version || '1.0.0'} running on port ${PORT}`);
  await initDb();
  console.log('Database initialized');
});
