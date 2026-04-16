const supabase = require('../config/supabase');

/**
 * GET /api/admin/stats
 */
exports.getStats = async (req, res) => {
  try {
    // 1. Count Total Donors
    const { count: donorCount, error: donorErr } = await supabase
      .from('donors')
      .select('*', { count: 'exact', head: true });

    // 2. Sum Blood Inventory
    // Note: If table is named 'blood_stock' in your DB, please rename it to 'blood_inventory' 
    // or update this code. Using 'blood_inventory' per requirements.
    const { data: inventory, error: invErr } = await supabase
      .from('blood_inventory')
      .select('units_available');
    
    const totalUnits = inventory ? inventory.reduce((sum, item) => sum + (item.units_available || 0), 0) : 0;

    // 3. Count Requests
    const { count: requestCount, error: reqErr } = await supabase
      .from('blood_requests')
      .select('*', { count: 'exact', head: true });

    const { count: fulfilledCount, error: fullErr } = await supabase
      .from('blood_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'fulfilled');

    res.json({
      success: true,
      data: {
        donors: donorCount || 0,
        inventory: totalUnits,
        requests: requestCount || 0,
        fulfilled: fulfilledCount || 0
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/admin/requests
 */
exports.getAllRequests = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('blood_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/admin/update-request-status
 */
exports.updateRequestStatus = async (req, res) => {
  try {
    const { request_id, status } = req.body;

    // 1. Always fetch request details for notification
    const { data: request, error: fetchErr } = await supabase
      .from('blood_requests')
      .select('*')
      .eq('id', request_id)
      .single();
    if (fetchErr) throw fetchErr;

    // 2. If approved, deduct from inventory
    if (status === 'Approved') {
      const { data: inv, error: invErr } = await supabase
        .from('blood_inventory')
        .select('*')
        .eq('blood_group', request.blood_group)
        .single();
      if (invErr) throw invErr;

      if (inv.units_available < request.units) {
        return res.status(400).json({ success: false, message: `Insufficient stock. Only ${inv.units_available} units of ${request.blood_group} available.` });
      }

      const newTotal = inv.units_available - request.units;
      await supabase
        .from('blood_inventory')
        .update({ units_available: newTotal })
        .eq('blood_group', request.blood_group);

      await supabase
        .from('inventory_logs')
        .insert([{
          blood_group: request.blood_group,
          units: newTotal,
          type: 'Withdrawal',
          note: `Approved Request #${request_id} — ${request.patient_name} (${request.units} units)`,
          timestamp: new Date().toISOString()
        }]);
    }

    // 3. Update the request status
    const { error } = await supabase
      .from('blood_requests')
      .update({ status })
      .eq('id', request_id);
    if (error) throw error;

    // 4. Insert a persistent notification for the requesting user
    const notifMsg = status === 'Approved'
      ? `✅ Your blood request (${request.blood_group} · ${request.units} units) for ${request.patient_name} has been APPROVED. Please proceed to ${request.hospital_name}.`
      : `❌ Your blood request (${request.blood_group} · ${request.units} units) for ${request.patient_name} has been REJECTED. Please contact the blood bank for details.`;

    await supabase
      .from('notifications')
      .insert([{
        user_id: request.user_id,
        message: notifMsg,
        type: status === 'Approved' ? 'success' : 'danger'
      }]);

    res.json({ success: true, message: `Request ${status.toLowerCase()} successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/notifications  (for the logged-in user)
 */
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


/**
 * GET /api/admin/reports
 */
exports.getReports = async (req, res) => {
  try {
    // Basic aggregation
    const [donors, requests, inventory, logs] = await Promise.all([
      supabase.from('donors').select('id', { count: 'exact' }),
      supabase.from('blood_requests').select('id, status, units', { count: 'exact' }),
      supabase.from('blood_inventory').select('*'),
      supabase.from('inventory_logs').select('*').eq('type', 'Withdrawal')
    ]);

    const totalDonors = donors.count || 0;
    const totalRequests = requests.count || 0;
    const approvedRequests = requests.data.filter(r => r.status === 'Approved').length;
    
    // Units dispensed (sum of units from logs where type is Withdrawal)
    // Actually better to sum from the requests that were approved
    const unitsDispensed = requests.data
      .filter(r => r.status === 'Approved')
      .reduce((sum, r) => sum + (r.units || 0), 0);

    // Grouping by blood group for chart
    const requestsByGroup = requests.data.reduce((acc, r) => {
      acc[r.blood_group] = (acc[r.blood_group] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        stats: {
          totalDonors,
          totalRequests,
          approvedRequests,
          unitsDispensed
        },
        requestsByGroup
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/admin/inventory
 */
exports.getInventory = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('blood_inventory')
      .select('*');

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/admin/update-inventory
 */
exports.updateInventory = async (req, res) => {
  try {
    const { blood_group, units, type, note } = req.body;
    
    // 1. Update Inventory
    const { error: invErr } = await supabase
      .from('blood_inventory')
      .update({ 
        units_available: units,
        last_updated: new Date().toISOString()
      })
      .eq('blood_group', blood_group);

    if (invErr) throw invErr;

    // 2. Create Log
    const { error: logErr } = await supabase
      .from('inventory_logs')
      .insert([{
        id: `LOG-${Date.now()}`,
        blood_group,
        type: type || 'Adjustment',
        units: units,
        note: note || 'Manual adjustment',
        timestamp: new Date().toISOString()
      }]);

    if (logErr) throw logErr;

    res.json({ success: true, message: 'Inventory updated and logged successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/admin/inventory-logs
 */
exports.getInventoryLogs = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('inventory_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/admin/donors
 */
exports.getAllDonors = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('donors')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/admin/donors/register
 */
exports.registerDonor = async (req, res) => {
  try {
    const { 
      name, age, gender, blood_group, available, 
      last_donation, medical_conditions, phone, email, city 
    } = req.body;

    const { data, error } = await supabase
      .from('donors')
      .insert([{
        name,
        age: parseInt(age),
        gender,
        blood_type: blood_group, // Map frontend blood_group to DB blood_type
        is_available: !!available, // Map frontend available to DB is_available
        last_donation: last_donation || null,
        medical_conditions,
        phone,
        email,
        city,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, donor: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
