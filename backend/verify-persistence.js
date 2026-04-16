const supabase = require('./src/config/supabase');

async function testPersistence() {
  const name = "Supabase Verified User";
  const email = `persisted_${Date.now()}@test.com`;
  const password = "securepassword123";

  console.log("🛠️ Starting Mandatory Persistence Verification...");

  const { data, error } = await supabase
    .from("users")
    .insert([{ name, email, password, is_verified: true, role: 'donor' }])
    .select();

  if (error) {
    console.error("❌ Persistence Failed:", error.message);
  } else {
    console.log("✅ Data Persisted Successfully!");
    console.log("Inserted Record:", data[0]);
    
    // Immediate Cleanup
    const { error: delError } = await supabase.from("users").delete().eq('id', data[0].id);
    if (!delError) console.log("🧹 Cleanup successful.");
  }
}

testPersistence();
