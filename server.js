const express = require('express');
const path = require('path');
require('dotenv').config();

const { analyzeDocument } = require('./src/controllers/analyzerController');
const initDb = require('./src/config/initDb');

const app = express();
app.use(express.json());

// Serve static frontend assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// API Endpoint
app.post('/api/v1/analyze', analyzeDocument);

// SPA Fallback: Send all other requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`LexiShield running on port ${PORT}`);
  await initDb();
});
