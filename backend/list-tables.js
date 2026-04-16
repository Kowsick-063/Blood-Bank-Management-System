const supabase = require('./src/config/supabase');
require('dotenv').config();

async function listAllTables() {
  console.log('📋 Fetching all table names from Supabase...');
  
  // Using an RPC call or a known system query if enabled, 
  // but simpler is to try common names or use the Prisma Client if configured.
  // Actually, I can use a raw SQL query via Supabase if the user has a function for it,
  // but I'll try more common names first.
  
  const commonNames = ['inventory', 'stock', 'blood_stock', 'donations_history', 'user_donations', 'blood_inventory_logs'];
  
  for (const table of commonNames) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (!error) console.log(`🎯 Found table: ${table}`);
  }
}

listAllTables();
