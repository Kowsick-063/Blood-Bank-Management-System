const supabase = require('../src/config/supabase');
require('dotenv').config();

async function clearTestData() {
  console.log('🧹 Clearing test data from database...');

  const tablesToClear = ['BloodRequest', 'Donation', 'Camp', 'BloodInventory'];
  
  for (const table of tablesToClear) {
    console.log(`🗑️ Clearing table [${table}]...`);
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) console.error(`❌ Error clearing ${table}:`, error.message);
    else console.log(`✅ Table [${table}] cleared.`);
  }

  console.log('👤 Clearing test users (keeping admin@bloodbank.com)...');
  const { error: userErr } = await supabase
    .from('User')
    .delete()
    .neq('email', 'admin@bloodbank.com');

  if (userErr) console.error('❌ Error clearing users:', userErr.message);
  else console.log('✅ Test users cleared.');

  console.log('✨ Database cleanup complete!');
}

clearTestData();
