require('dotenv').config();
const { Client } = require('pg');

async function listRealTables() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('Real Tables in public schema:');
    res.rows.forEach(row => console.log(' - ' + row.table_name));
  } catch (err) {
    console.error('Error fetching tables:', err.message);
  } finally {
    await client.end();
  }
}

listRealTables();
