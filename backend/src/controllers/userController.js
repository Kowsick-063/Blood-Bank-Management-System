const supabase = require('../config/supabase');
const { sendRequestAlert } = require('../utils/email');

/**
 * GET /api/user/profile
 */
exports.getProfile = async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store'); // Disable caching
    console.log(`🔍 Fetching profile for User ID: ${req.user.id}`);
    const { data: user, error } = await supabase
      .from('users')
      .select('*, donors(*)')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('❌ Profile fetch error:', error.message);
      throw error;
    }

    console.log('✅ Raw user data from DB:', JSON.stringify(user, null, 2));

    // Handle both array and object formats for joined data
    const donorData = Array.isArray(user.donors) ? user.donors[0] : user.donors;
    
    if (donorData) {
      console.log('🎯 Found donor data, merging...');
      user.age = donorData.age;
      user.phone = donorData.phone;
      user.blood_group = donorData.blood_type;
      user.weight = donorData.weight;
    } else {
      console.warn('⚠️ No donor data found for this user in the donors table.');
    }
    
    delete user.donors;
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/user/update-profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { age, phone, blood_group } = req.body;
    
    // Update donors table specifically
    const { error } = await supabase
      .from('donors')
      .update({ age, phone, blood_type: blood_group }) // Mapping blood_group to blood_type
      .eq('userId', req.user.id);

    if (error) throw error;
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/user/stats
 */
exports.getUserStats = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('donors')
      .select('total_donations, last_donation_date')
      .eq('userId', req.user.id)
      .single();

    if (error) throw error;

    const totalDonations = data?.total_donations || 0;
    res.json({
      success: true,
      data: {
        total_donations: totalDonations,
        last_donation: data?.last_donation_date || 'N/A',
        lives_saved: totalDonations * 3
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/user/request-blood
 */
exports.requestBlood = async (req, res) => {
  try {
    const { patient_name, blood_group, units, hospital, urgency, latitude, longitude } = req.body;
    
    let result;
    if (latitude !== undefined && longitude !== undefined) {
      // Use RPC for PostGIS insertion
      const { data, error } = await supabase.rpc('create_blood_request', {
        p_user_id: req.user.id,
        p_patient_name: patient_name,
        p_blood_type: blood_group,
        p_units: parseInt(units),
        p_hospital: hospital,
        p_urgency: urgency,
        p_latitude: parseFloat(latitude),
        p_longitude: parseFloat(longitude)
      });
      if (error) throw error;
      result = data;
    } else {
      // Fallback for no GPS
      const { data, error } = await supabase
        .from('blood_requests')
        .insert({
          userId: req.user.id,
          patient_name: patient_name,
          blood_type: blood_group,
          units: parseInt(units),
          hospital: hospital,
          urgency,
          status: 'pending'
        });
      if (error) throw error;
      result = data;
    }

    // Trigger Notification for Admin
    await sendRequestAlert('bloodbee880@gmail.com', {
      patient_name,
      blood_type: blood_group,
      units,
      location: hospital,
      urgency
    });

    res.json({ success: true, message: 'Blood request submitted successfully' });
  } catch (err) {
    console.error('[Request Blood Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/user/donate
 */
exports.donateBlood = async (req, res) => {
  try {
    const { units, blood_group } = req.body;
    
    // 1. Insert Donation Record
    const { error: donErr } = await supabase
      .from('donations')
      .insert({
        donor_id: req.user.id,
        units,
        blood_group,
        date: new Date().toISOString()
      });
    if (donErr) throw donErr;

    // 2. Update Donor Stats
    const { data: donor } = await supabase
      .from('donors')
      .select('total_donations')
      .eq('userId', req.user.id)
      .single();
    
    const newTotal = (donor?.total_donations || 0) + 1;
    await supabase.from('donors')
      .update({ total_donations: newTotal, last_donation_date: new Date().toISOString() })
      .eq('userId', req.user.id);

    // 3. Update Inventory
    const { data: inv } = await supabase
      .from('blood_inventory')
      .select('units_available')
      .eq('blood_group', blood_group)
      .single();
    
    const newInv = (inv?.units_available || 0) + units;
    await supabase.from('blood_inventory')
      .update({ units_available: newInv })
      .eq('blood_group', blood_group);

    res.json({ success: true, message: 'Thank you for your donation!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/user/history
 */
exports.getHistory = async (req, res) => {
  try {
    // 1. Fetch Donations
    const { data: donations } = await supabase
      .from('donations')
      .select('*')
      .eq('donorId', req.user.id) // Corrected from donor_id to match schema
      .order('createdAt', { ascending: false });

    // 2. Fetch Blood Requests
    const { data: requests } = await supabase
      .from('blood_requests')
      .select('*')
      .eq('userId', req.user.id)
      .order('createdAt', { ascending: false });

    // Combine and mark types
    const combinedHistory = [
      ...(donations || []).map(d => ({ ...d, type: 'donation', date: d.createdAt })),
      ...(requests || []).map(r => ({ ...r, type: 'request', date: r.createdAt }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ success: true, data: combinedHistory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
