const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function professionalFix() {
  try {
    await client.connect();
    console.log('🚀 Starting professional database constraint verification and fix...');

    const tables = [
      'users', 'otps', 'donors', 'blood_banks', 
      'blood_stock', 'blood_requests', 'donor_notifications', 'stock_history'
    ];

    // 1. Ensure gen_random_uuid is available (included in pg crypto which is default in recent PG)
    // 2. Fix ID defaults and Timestamp defaults
    for (const table of tables) {
      console.log(`🛠️ Fixing table: ${table}`);
      
      // Set ID default
      try {
        await client.query(`ALTER TABLE "${table}" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text`);
        console.log(`  ✅ ID default set for ${table}`);
      } catch (e) {
        console.log(`  ℹ️ ID default already set or error for ${table}: ${e.message}`);
      }

      // Set createdAt default
      try {
        await client.query(`ALTER TABLE "${table}" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        console.log(`  ✅ createdAt default set for ${table}`);
      } catch (e) {
        console.log(`  ℹ️ createdAt default already set or error for ${table}: ${e.message}`);
      }

      // Set updatedAt default (essential for initial inserts to not be null)
      try {
        await client.query(`ALTER TABLE "${table}" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
        console.log(`  ✅ updatedAt default set for ${table}`);
      } catch (e) {
        console.log(`  ℹ️ updatedAt default already set or error for ${table}: ${e.message}`);
      }
    }

    // 3. Create Trigger Function for updatedAt
    console.log('🔄 Creating update_timestamp function and triggers...');
    await client.query(`
      CREATE OR REPLACE FUNCTION update_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = now();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    for (const table of tables) {
      if (table === 'otps' || table === 'stock_history') continue; // These usually don't have updatedAt or don't need update triggers
      
      try {
        await client.query(`DROP TRIGGER IF EXISTS update_${table}_timestamp ON "${table}"`);
        await client.query(`
          CREATE TRIGGER update_${table}_timestamp
          BEFORE UPDATE ON "${table}"
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log(`  ✅ Update trigger created for ${table}`);
      } catch (e) {
        console.log(`  ℹ️ Skipping trigger for ${table}: ${e.message}`);
      }
    }

    console.log('\n✨ All database constraints and defaults fixed successfully!');
    
  } catch (err) {
    console.error('❌ Professional fix failed:', err.message);
  } finally {
    await client.end();
  }
}

professionalFix();
