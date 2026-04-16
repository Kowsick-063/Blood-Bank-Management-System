const prisma = require('../src/prisma/client');

async function setupPostGIS() {
  try {
    console.log('Enabling PostGIS extension...');
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS postgis;`);

    console.log('Creating find_nearest_donors function...');
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION find_nearest_donors(
        user_lat double precision, 
        user_lon double precision, 
        radius_km double precision
      )
      RETURNS TABLE (
        id text,
        "userId" text,
        name text,
        blood_type text,
        phone text,
        distance_km double precision
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          d.id,
          d."userId",
          u.name,
          d.blood_type,
          d.phone,
          (ST_DistanceSphere(
            ST_MakePoint(d.longitude, d.latitude)::geometry, 
            ST_MakePoint(user_lon, user_lat)::geometry
          ) / 1000) AS distance_km
        FROM donors d
        JOIN users u ON d."userId" = u.id
        WHERE d.is_available = true
          AND (ST_DistanceSphere(
            ST_MakePoint(d.longitude, d.latitude)::geometry, 
            ST_MakePoint(user_lon, user_lat)::geometry
          ) / 1000) <= radius_km
        ORDER BY distance_km ASC;
      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log('✅ PostGIS and nearby donors function setup successfully.');
  } catch (error) {
    console.error('❌ Error setting up DB functions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupPostGIS();
