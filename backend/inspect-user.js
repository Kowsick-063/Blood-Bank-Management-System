const supabase = require('./src/config/supabase');
require('dotenv').config();

async function inspectUser() {
  const email = 'ragulselvam006@gmail.com';
  console.log(`🔍 Inspecting data for: ${email}`);
  
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*, donors(*)')
    .eq('email', email)
    .single();
  
  if (userError) {
    console.error('❌ User not found or error:', userError.message);
    return;
  }
  
  console.log('✅ User data:', JSON.stringify(user, null, 2));
}

inspectUser();
