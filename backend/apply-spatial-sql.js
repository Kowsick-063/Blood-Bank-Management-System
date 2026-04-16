const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function runSql() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    const sql = fs.readFileSync('setup-spatial-search.sql', 'utf8');
    await client.query(sql);
    console.log('✅ Spatial search functions created successfully!');

  } catch (err) {
    console.error('❌ Error executing SQL:', err.message);
  } finally {
    await client.end();
  }
}

runSql();
