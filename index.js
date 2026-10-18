const express = require('express');
const path = require('path');
const helmet = require('helmet');
require('dotenv').config();

const initDb = require('./src/config/initDb.js');
const apiRoutes = require('./src/routes/apiRoutes.js');

const app = express();

app.use(helmet());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1', apiRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`LexiShield running on port ${PORT}`);
  await initDb();
});
