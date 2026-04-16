const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function fixAllDefaults() {
  try {
    await client.connect();
    const tables = ['users', 'otps', 'donors', 'blood_banks', 'blood_stock'];
    
    for (const table of tables) {
      console.log(`🛠️ Fixing defaults for ${table}...`);
      
      // Fix ID
      await client.query(`ALTER TABLE ${table} ALTER COLUMN id SET DEFAULT gen_random_uuid()::text`);
      
      // Fix timestamps
      try {
        await client.query(`ALTER TABLE ${table} ALTER COLUMN "createdAt" SET DEFAULT NOW()`);
      } catch (e) {}
      
      try {
        await client.query(`ALTER TABLE ${table} ALTER COLUMN "updatedAt" SET DEFAULT NOW()`);
      } catch (e) {}
    }
    
    console.log('✅ ALL Database Defaults set successfully!');
  } catch (err) {
    console.error('❌ Fix failed:', err.message);
  } finally {
    await client.end();
  }
}

fixAllDefaults();
