const supabase = require('./src/config/supabase');
require('dotenv').config();

async function forceVerify() {
  const email = 'ragultherock212@gmail.com';
  console.log(`🚀 Force-verifying ${email}...`);
  
  const { error: updateError } = await supabase
    .from('users')
    .update({ is_verified: true })
    .eq('email', email);

  if (updateError) {
    console.error('❌ Update Error:', updateError.message);
  } else {
    console.log('✅ User marked as VERIFIED.');
    await supabase.from('otps').delete().eq('email', email);
    console.log('✅ OTP record cleaned up.');
  }
}

forceVerify();
