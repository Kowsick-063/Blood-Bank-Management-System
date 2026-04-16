const prisma = require('../prisma/client');

// ─── POST /api/donors/register ────────────────────────────────────────────────
const registerDonor = async (req, res) => {
  try {
    const { blood_type, age, weight, phone, latitude, longitude } = req.body;
    const userId = req.user.id;

    if (!blood_type || !age || !weight || !phone || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'All donor fields are required, including location.' });
    }

    const validLat = parseFloat(latitude);
    const validLng = parseFloat(longitude);

    // Check if donor already exists for this user
    const existingDonor = await prisma.donor.findUnique({ where: { userId } });
    if (existingDonor) {
      return res.status(400).json({ message: 'Donor profile already exists for this user.' });
    }

    // Insert location using raw PostGIS geography query
    const [donor] = await prisma.$queryRaw`
      INSERT INTO donors (id, "userId", blood_type, age, weight, phone, location, is_available, "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid()::text,
        ${userId},
        ${blood_type},
        ${parseInt(age, 10)},
        ${parseFloat(weight)},
        ${phone},
        ST_SetSRID(ST_MakePoint(${validLng}, ${validLat}), 4326)::geography,
        true,
        NOW(),
        NOW()
      )
      RETURNING id, "userId", blood_type, age, weight, phone, is_available,
        ST_Y(location::geometry) as lat,
        ST_X(location::geometry) as lng;
    `;

    return res.status(201).json({ message: 'Registered as donor successfully', donor });
  } catch (err) {
    console.error('[Register Donor Error]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── PUT /api/donors/availability ─────────────────────────────────────────────
const toggleAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const { is_available } = req.body;

    if (typeof is_available !== 'boolean') {
      return res.status(400).json({ message: 'is_available boolean is required' });
    }

    const donor = await prisma.donor.update({
      where: { userId },
      data: { is_available },
    });

    return res.status(200).json({ message: 'Availability updated', is_available: donor.is_available });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Donor profile not found' });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── GET /api/donors/nearby ───────────────────────────────────────────────────
const getNearbyDonors = async (req, res) => {
  try {
    const { latitude, longitude, radius = 50 } = req.query; // default radius 50km

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'latitude and longitude query parameters are required' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseFloat(radius);

    // Retrieve via raw spatial query using ST_DistanceSphere alongside ST_Y/ST_X
    const nearestDonors = await prisma.$queryRaw`
      SELECT 
        d.id, 
        d."userId", 
        u.name, 
        d.blood_type, 
        d.phone,
        ST_Y(d.location::geometry) as lat,
        ST_X(d.location::geometry) as lng,
        (ST_DistanceSphere(
          ST_MakePoint(${lng}, ${lat})::geometry,
          d.location::geometry
        ) / 1000) AS distance_km
      FROM donors d
      JOIN users u ON d."userId" = u.id
      WHERE d.is_available = true
        AND (ST_DistanceSphere(
          ST_MakePoint(${lng}, ${lat})::geometry,
          d.location::geometry
        ) / 1000) <= ${rad}
      ORDER BY distance_km ASC;
    `;

    return res.status(200).json({
      message: 'Nearby donors retrieved',
      count: nearestDonors.length,
      donors: nearestDonors,
    });
  } catch (err) {
    console.error('[Get Nearby Donors Error]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { registerDonor, toggleAvailability, getNearbyDonors };
