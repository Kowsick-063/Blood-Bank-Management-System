const supabase = require('./src/config/supabase');
require('dotenv').config();

async function checkStock() {
  const { data, error } = await supabase.from('blood_stock').select('*').limit(1);
  if (data) console.log('✅ blood_stock columns:', Object.keys(data[0] || {}).join(', '));
  else console.log('❌ blood_stock empty or error');
}

checkStock();
