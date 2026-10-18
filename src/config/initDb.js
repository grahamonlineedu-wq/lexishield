const sql = require('./db');

async function initDb() {
  if (!sql) {
    console.warn('Database not configured. Set DATABASE_URL in your environment to enable persistence.');
    return;
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS contract_analyses (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        document_preview TEXT,
        document_hash VARCHAR(128),
        risk_score VARCHAR(50),
        summary TEXT,
        flags JSONB,
        missing_clauses JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        reference VARCHAR(255) UNIQUE,
        user_id VARCHAR(255),
        plan_type VARCHAR(100),
        amount BIGINT,
        currency VARCHAR(10),
        status VARCHAR(50),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_credits (
        user_id VARCHAR(255) PRIMARY KEY,
        credits INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log('Neon DB schema initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize database schema:', err.message);
  }
}

module.exports = initDb;
