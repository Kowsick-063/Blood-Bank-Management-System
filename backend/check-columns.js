const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function checkColumns() {
  try {
    await client.connect();
    const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'blood_banks'
    `);
    console.log('Columns in blood_banks:');
    res.rows.forEach(row => console.log(' -', row.column_name));
    
    const res2 = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'blood_stock'
    `);
    console.log('Columns in blood_stock:');
    res2.rows.forEach(row => console.log(' -', row.column_name));
  } catch (err) {
    console.error('❌ Check failed:', err.message);
  } finally {
    await client.end();
  }
}

checkColumns();
