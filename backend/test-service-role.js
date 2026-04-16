const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testRoles() {
  console.log('🧪 Testing Service Role Permissions...');
  
  // Try to insert without restriction
  const { data, error } = await supabase
    .from('users')
    .insert([{ name: 'Role Test', email: `role_test_${Date.now()}@test.com`, password: '123' }])
    .select();

  if (error) {
    console.error('❌ Service Role Insert Failed:', error.message);
    if (error.message.includes('API key')) {
        console.log('💡 The Service Role Key provided might be invalid.');
    }
  } else {
    console.log('✅ Service Role Insert Successful! Data is persisting.');
    await supabase.from('users').delete().eq('id', data[0].id);
  }
}

testRoles();
