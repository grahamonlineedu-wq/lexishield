const sql = require('./db');

async function initDb() {
  if (!sql) return;
  try {
    // 1. Create contract_analyses table
    await sql`
      CREATE TABLE IF NOT EXISTS contract_analyses (
        id SERIAL PRIMARY KEY,
        raw_text TEXT NOT NULL,
        risk_score VARCHAR(50),
        summary TEXT,
        flags JSONB,
        missing_clauses JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Create users table for SaaS auth/credits
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        api_key VARCHAR(100) UNIQUE NOT NULL,
        subscription_status VARCHAR(50) DEFAULT 'free',
        credits_remaining INT DEFAULT 3,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log('Neon DB schema initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize database schema:', err.message);
  }
}

module.exports = initDb;
