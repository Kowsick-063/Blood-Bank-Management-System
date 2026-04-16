const supabase = require('./src/config/supabase');
require('dotenv').config();

async function exploreSchema() {
  console.log('🔍 Exploring Database Tables...');
  
  // List common tables
  const tables = ['users', 'donors', 'blood_inventory', 'blood_requests', 'donations'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Table [${table}]: Error - ${error.message}`);
      } else {
        const columns = data.length > 0 ? Object.keys(data[0]) : 'Found but empty';
        console.log(`✅ Table [${table}]: Columns -> ${Array.isArray(columns) ? columns.join(', ') : columns}`);
      }
    } catch (e) {
      console.log(`❌ Table [${table}]: Fatal error`);
    }
  }
}

exploreSchema();
