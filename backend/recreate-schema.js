require('dotenv').config();
const { Client } = require('pg');

async function fixDatabaseSchema() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log('🔄 Re-syncing database schema for "Blood Bee"...');

    // 1. Drop existing mismatched tables
    const dropQuery = `
      DROP TABLE IF EXISTS "BloodRequest" CASCADE;
      DROP TABLE IF EXISTS "BloodInventory" CASCADE;
      DROP TABLE IF EXISTS "Donation" CASCADE;
      DROP TABLE IF EXISTS "BloodBank" CASCADE;
      DROP TABLE IF EXISTS "Camp" CASCADE;
      DROP TABLE IF EXISTS "User" CASCADE;
      DROP TABLE IF EXISTS "users" CASCADE;
      DROP TABLE IF EXISTS "donors" CASCADE;
      DROP TABLE IF EXISTS "blood_inventory" CASCADE;
      DROP TABLE IF EXISTS "blood_requests" CASCADE;
    `;
    await client.query(dropQuery);
    console.log('✅ Dropped old tables');

    // 2. Create users table
    const createUsers = `
      CREATE TABLE users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'donor',
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await client.query(createUsers);
    console.log('✅ Created "users" table');

    // 3. Create donors table
    const createDonors = `
      CREATE TABLE donors (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
        age INTEGER,
        gender TEXT,
        blood_type TEXT,
        phone TEXT,
        city TEXT,
        weight NUMERIC,
        last_donation DATE,
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION
      );
    `;
    await client.query(createDonors);
    console.log('✅ Created "donors" table');

    // 4. Create blood_inventory table
    const createInventory = `
      CREATE TABLE blood_inventory (
        blood_group TEXT PRIMARY KEY,
        units_available INTEGER DEFAULT 0,
        max_limit INTEGER DEFAULT 100,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await client.query(createInventory);
    
    // Seed inventory
    const seedInventory = `
      INSERT INTO blood_inventory (blood_group, units_available) VALUES 
      ('A+', 0), ('A-', 0), ('B+', 0), ('B-', 0), 
      ('O+', 0), ('O-', 0), ('AB+', 0), ('AB-', 0);
    `;
    await client.query(seedInventory);
    console.log('✅ Created and seeded "blood_inventory"');

    // 5. Create blood_requests table
    const createRequests = `
      CREATE TABLE blood_requests (
        id TEXT PRIMARY KEY,
        patient_name TEXT,
        blood_group TEXT,
        units_requested INTEGER,
        hospital_name TEXT,
        doctor_name TEXT,
        urgency TEXT,
        contact_number TEXT,
        status TEXT DEFAULT 'pending',
        user_id UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await client.query(createRequests);
    console.log('✅ Created "blood_requests" table');

    // 6. Create initial super admin
    const bcrypt = require('bcryptjs');
    const hashedPass = await bcrypt.hash('admin123', 10);
    const createAdmin = `
      INSERT INTO users (name, email, password, role, is_verified)
      VALUES ('System Admin', 'admin@bloodbank.com', '${hashedPass}', 'admin', true);
    `;
    await client.query(createAdmin);
    console.log('✅ Created Super Admin (admin@bloodbank.com / admin123)');

  } catch (err) {
    console.error('❌ Schema fix failed:', err.message);
  } finally {
    await client.end();
  }
}

fixDatabaseSchema();
