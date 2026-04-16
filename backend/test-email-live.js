require('dotenv').config();
const { sendOTPEmail } = require('./src/utils/email');

async function testEmail() {
  console.log('🧪 Starting Live Email Test...');
  console.log(`Using Email: ${process.env.EMAIL_USER}`);
  
  try {
    await sendOTPEmail(process.env.EMAIL_USER, 'Test User', '123456');
    console.log('✅ Email sent successfully! Please check your inbox (including Spam).');
  } catch (err) {
    console.error('❌ Email Failed:', err.message);
    console.log('\n💡 Possible reasons:');
    console.log('1. The App Password "EMAIL_PASS" is incorrect or expired.');
    console.log('2. "Less secure apps" or "App Passwords" are disabled in your Google account.');
    console.log('3. Your network is blocking port 465 or 587.');
  }
}

testEmail();
