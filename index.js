require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./src/routes/apiRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Serve front-end static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    engine: `${process.env.APP_NAME || 'LexiShield'} Core Engine`,
    message: 'LexiShield API is active and ready on Termux' 
  });
});

app.use('/api/v1', apiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n=================================`);
  console.log(` 🛡️  LexiShield Running on http://localhost:${PORT}`);
  console.log(` Interface available in browser`);
  console.log(`=================================\n`);
});

