const supabase = require('../config/supabase');

// ─── POST /api/requests ────────────────────────────────────────────────────────
const createRequest = async (req, res) => {
  try {
    const { 
        patient_name, blood_group, units, hospital_name, 
        doctor_name, contact_number, urgency, reason, city 
    } = req.body;
    const userId = req.user.id;

    if (!patient_name || !blood_group || !units || !hospital_name || !contact_number || !city) {
      return res.status(400).json({ message: 'Missing required request fields' });
    }

    const { data: newRequest, error } = await supabase
      .from('blood_requests')
      .insert([{
        id: `REQ-${Date.now()}`,
        user_id: userId,
        patient_name,
        blood_group,
        units: parseInt(units),
        hospital_name,
        doctor_name,
        contact_number,
        urgency: urgency || 'Normal',
        reason,
        city,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ 
      success: true,
      message: 'Blood request created successfully', 
      request: newRequest 
    });
  } catch (err) {
    console.error('[Create Request Error]', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── GET /api/requests/my ──────────────────────────────────────────────────────
const getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: requests, error } = await supabase
      .from('blood_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, requests });
  } catch (err) {
    console.error('[Get My Requests Error]', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── GET /api/requests/:id ─────────────────────────────────────────────────────
const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: request, error } = await supabase
      .from('blood_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !request) return res.status(404).json({ message: 'Blood request not found' });
    return res.status(200).json({ success: true, request });
  } catch (err) {
    console.error('[Get Request By ID Error]', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { createRequest, getMyRequests, getRequestById };
