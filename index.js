const express = require('express');
const path = require('path');
require('dotenv').config();

const initDb = require('./src/config/initDb.js');
const { analyzeDocument } = require('./src/controllers/analyzerController.js');

const app = express();
app.use(express.json());

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/v1/analyze', analyzeDocument);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`LexiShield running at http://localhost:${PORT}`);
  // Initialize database schema
  await initDb();
});
