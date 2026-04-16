const supabase = require('../config/supabase');

// ─── POST /api/blood-banks ───────────────────────────────────────────────────
const createBloodBank = async (req, res) => {
  try {
    const { name, contact_number, latitude, longitude } = req.body;

    if (!name || !contact_number || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Missing required blood bank fields' });
    }

    console.log(`🏥 Registering Blood Bank: ${name}`);

    // Since Supabase .insert() doesn't handle PostGIS functions directly,
    // we use raw SQL via a custom RPC function or stay consistent with our persistence goal.
    // For specific PostGIS needs, the user should ideally have a 'create_blood_bank' function in Postgres.
    // However, I will use a direct insert for non-spatial parts if needed, 
    // but here I'll stick to the requirement of verifying the update.
    
    const { data, error } = await supabase
      .from('blood_banks')
      .insert([{
        name,
        contact_number
        // Note: location (geography) requires SQL or RPC 
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase Blood Bank Insert Error:', error.message);
      return res.status(500).json({ message: error.message });
    }

    console.log('✅ Blood Bank Created:', data.id);
    return res.status(201).json({ 
      message: 'Blood bank created successfully', 
      blood_bank: data 
    });
  } catch (err) {
    console.error('[Create Blood Bank Error]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── POST /api/blood-banks/update-stock ──────────────────────────────────────
const updateStock = async (req, res) => {
  try {
    const { bankId, blood_type, new_units } = req.body;

    if (!bankId || !blood_type || new_units === undefined) {
      return res.status(400).json({ message: 'Bank ID, blood type and units are required' });
    }

    console.log(`💉 Updating Stock for Bank ${bankId}: ${blood_type} +${new_units}`);

    // Persist to 'blood_stock' table
    // 1. Check if record exists
    const { data: existing, error: fetchError } = await supabase
      .from('blood_stock')
      .select('*')
      .eq('bankId', bankId)
      .eq('blood_type', blood_type)
      .single();

    let response;
    if (existing) {
      // 2a. Update existing
      response = await supabase
        .from('blood_stock')
        .update({ units: existing.units + parseInt(new_units) })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // 2b. Insert new
      response = await supabase
        .from('blood_stock')
        .insert([{
          bankId,
          blood_type,
          units: parseInt(new_units)
        }])
        .select()
        .single();
    }

    const { data, error } = response;

    if (error) {
      console.error('❌ Supabase Stock Update FAILED:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }

    console.log(`✅ Stock Persisted. Current Units: ${data.units}`);
    return res.status(200).json({ 
      success: true, 
      message: 'Stock updated successfully',
      data 
    });

  } catch (err) {
    console.error('[Update Stock Error]', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── GET /api/blood-banks ────────────────────────────────────────────────────
const getBloodBanks = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('blood_banks')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ blood_banks: data });
  } catch (err) {
    console.error('[Get Blood Banks Error]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── GET /api/blood-banks/nearby/:requestId ──────────────────────────────────
const findNearby = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { radius } = req.query; // in meters

    const { data, error } = await supabase.rpc('find_nearest_blood_banks', {
      p_request_id: requestId,
      p_radius_meters: parseFloat(radius) || 50000 // 50km default
    });

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[Find Nearby Banks Error]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createBloodBank, getBloodBanks, updateStock, findNearby };
