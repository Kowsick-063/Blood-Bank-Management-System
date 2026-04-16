const supabase = require('./src/config/supabase');
require('dotenv').config();

async function testRequest() {
  console.log('🧪 Testing blood request insertion...');
  const { data, error } = await supabase
    .from('blood_requests')
    .insert({
      userId: '309123e1-b1e0-45f6-9735-db28a7697176',
      patient_name: 'Test Patient',
      blood_type: 'A+',
      units: 2,
      location: 'Test Hospital', // This is likely the problem if it's geography
      urgency: 'normal',
      status: 'pending'
    });

  if (error) {
    console.error('❌ Insert failed:', error.message);
    console.error('Hint:', error.hint);
    console.error('Details:', error.details);
  } else {
    console.log('✅ Insert successful!');
  }
}

testRequest();
