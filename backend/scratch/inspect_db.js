const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { Client } = require('pg');
require('dotenv').config();

async function inspect() {
    console.log('--- Inspecting blood_requests columns via SQL ---');
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await client.connect();
        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'blood_requests'
        `);
        console.log('Columns found:', res.rows.map(r => r.column_name));
    } catch (err) {
        console.error('SQL Error:', err.message);
    } finally {
        await client.end();
    }
}

inspect();

inspect();
