const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is missing in .env!');
}

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

module.exports = sql;
