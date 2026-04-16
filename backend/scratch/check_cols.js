require('dotenv').config();
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

client.connect()
  .then(() => client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'donors'"))
  .then(res => {
    console.log('Columns and types in donors table:');
    res.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
