const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_service_role_key_here'
  ? process.env.SUPABASE_SERVICE_ROLE_KEY 
  : process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase URL or Key is missing in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Verification helper
const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) throw error;
    console.log('✅ Supabase Connection: Verified');
  } catch (err) {
    console.error('⚠️ Supabase Connection Warning:', err.message);
    console.log('💡 Note: This is normal if RLS is enabled and you are using the Anon Key instead of Service Role Key.');
  }
};

testSupabaseConnection();

module.exports = supabase;
