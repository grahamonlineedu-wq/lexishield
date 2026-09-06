const sql = require('./db');

async function initDb() {
  if (!sql) return;
  try {
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
    console.log('Neon DB schema initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize database schema:', err.message);
  }
}

module.exports = initDb;
