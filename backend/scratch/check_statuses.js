require('dotenv').config();
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

client.connect()
  .then(() => client.query("SELECT DISTINCT status FROM blood_requests"))
  .then(res => {
    console.log('Unique statuses:', res.rows.map(r => r.status));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
