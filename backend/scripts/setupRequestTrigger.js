const prisma = require('../src/prisma/client');

async function setupRequestTrigger() {
  try {
    console.log('Creating auto_match_request function and trigger...');
    
    // Create the trigger function
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION auto_match_request()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Find nearby available donors matching blood type
        INSERT INTO request_matches (id, "requestId", "donorId", distance_km, status, "createdAt", "updatedAt")
        SELECT 
          gen_random_uuid(),
          NEW.id,
          d.id,
          (ST_DistanceSphere(
            ST_MakePoint(d.longitude, d.latitude)::geometry, 
            ST_MakePoint(NEW.longitude, NEW.latitude)::geometry
          ) / 1000) AS distance_km,
          'pending',
          NOW(),
          NOW()
        FROM donors d
        WHERE d.is_available = true
          AND d.blood_type = NEW.blood_type
          -- Exclude the requester themselves if they are a donor
          AND d."userId" != NEW."userId"
          AND (ST_DistanceSphere(
            ST_MakePoint(d.longitude, d.latitude)::geometry, 
            ST_MakePoint(NEW.longitude, NEW.latitude)::geometry
          ) / 1000) <= 50 -- 50km radius
        ORDER BY distance_km ASC
        LIMIT 10;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Attach trigger to blood_requests
    await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trigger_auto_match ON blood_requests;`);
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER trigger_auto_match
      AFTER INSERT ON blood_requests
      FOR EACH ROW
      EXECUTE FUNCTION auto_match_request();
    `);

    console.log('✅ Trigger auto_match_request created successfully');
  } catch (error) {
    console.error('❌ Error setting up DB trigger:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupRequestTrigger();
