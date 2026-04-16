const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function checkDefault() {
  try {
    await client.connect();
    const res = await client.query(`
      SELECT column_name, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'id'
    `);
    console.log('ID Column Default:', res.rows[0]?.column_default);
    
    // Fix it if missing
    if (!res.rows[0]?.column_default) {
      console.log('🛠️ Fixing missing ID default...');
      await client.query('ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid()::text');
      await client.query('ALTER TABLE otps ALTER COLUMN id SET DEFAULT gen_random_uuid()::text');
      await client.query('ALTER TABLE donors ALTER COLUMN id SET DEFAULT gen_random_uuid()::text');
      console.log('✅ Defaults set successfully!');
    }
  } catch (err) {
    console.error('❌ Check/Fix failed:', err.message);
  } finally {
    await client.end();
  }
}

checkDefault();
