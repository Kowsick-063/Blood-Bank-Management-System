require('dotenv').config();
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

client.connect()
  .then(() => client.query("SELECT DISTINCT blood_group FROM blood_requests"))
  .then(res => {
    console.log('Unique blood groups in requests:', res.rows.map(r => r.blood_group));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
