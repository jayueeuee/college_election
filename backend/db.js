const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
 throw new Error('DATABASE_URL environment variable is not set.');
}

const pool = new Pool({
  connectionString,
  max: 20,
});

async function query(text, params) {
  return pool.query(text, params);
}

async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query,
  withTransaction,
};
