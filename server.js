const express = require('express');
const path = require('path');
require('dotenv').config();

const { analyzeDocument } = require('./src/controllers/analyzerController');
const initDb = require('./src/config/initDb');

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));
app.post('/api/v1/analyze', analyzeDocument);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`LexiShield running on port ${PORT}`);
  await initDb();
});
