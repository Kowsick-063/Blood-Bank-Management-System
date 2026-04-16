const supabase = require('./src/config/supabase');
require('dotenv').config();

async function checkOTP() {
  const email = 'ragultherock212@gmail.com';
  console.log(`🔍 Inspecting OTP record for ${email}...`);
  
  const { data, error } = await supabase
    .from('otps')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('❌ Error or no record found:', error.message);
  } else {
    console.log('✅ OTP Record Found:');
    console.log(`   OTP Hash: ${data.otp_hash}`);
    console.log(`   Expires At: ${data.expires_at}`);
    console.log(`   Attempts: ${data.attempts}`);
    console.log(`   System Time (Now): ${new Date().toISOString()}`);
    
    const expiry = new Date(data.expires_at);
    const now = new Date();
    const diff = (expiry - now) / 1000;
    
    console.log(`   Time remaining: ${diff.toFixed(2)} seconds`);
    
    if (diff < 0) {
      console.log('⚠️ RECORD IS OFFICIALLY EXPIRED');
    } else {
      console.log('🟢 Record is still valid!');
    }
  }
}

checkOTP();
