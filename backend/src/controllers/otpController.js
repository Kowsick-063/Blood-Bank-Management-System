const supabase = require('../config/supabase');
const { generateOTP, hashOTP, verifyOTP } = require('../utils/otp');
const { sendOTPEmail } = require('../utils/email');

/**
 * POST /api/auth/send-otp
 * Generates and sends a new OTP
 */
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    console.log(`📡 Sending OTP request for: ${email}`);

    // 1. Generate OTP
    const otp = generateOTP();
    const otp_hash = await hashOTP(otp);
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes (with buffer)

    // 2. Store or Update in Supabase
    const { error: upsertError } = await supabase
      .from('otps')
      .upsert({
        email: email.toLowerCase(),
        otp_hash,
        expires_at,
        attempts: 0
      }, { onConflict: 'email' });

    if (upsertError) {
      console.error('❌ Supabase OTP Persistence Error:', upsertError.message);
      return res.status(500).json({ success: false, message: upsertError.message });
    }

    console.log('✅ OTP persisted to Supabase');

    // 3. Send Email
    try {
      await sendOTPEmail(email, 'User', otp);
      console.log(`📧 OTP email dispatched to ${email}`);
      res.status(200).json({ success: true, message: `Verification code sent to ${email}` });
    } catch (emailErr) {
      console.error('❌ SMTP Dispatch Error:', emailErr.message);
      res.status(500).json({ success: false, message: 'Failed to send email. Check SMTP settings.' });
    }

  } catch (err) {
    console.error('[Send OTP Error]', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * POST /api/auth/verify-otp
 * Validates OTP and updates user verification status
 */
exports.verifyOTPFlow = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    console.log(`🔍 Verifying OTP for: ${email}`);

    const { data: otpRecord, error: fetchError } = await supabase
      .from('otps')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (fetchError || !otpRecord) {
      console.error('❌ OTP Lookup Error:', fetchError?.message || 'Record not found');
      return res.status(404).json({ success: false, message: 'No verification code found for this email' });
    }

    // Check attempts limit
    if (otpRecord.attempts >= 5) {
      console.warn(`🛑 Max attempts reached for: ${email}`);
      return res.status(429).json({ success: false, message: 'Too many failed attempts. Request a new code.' });
    }

    // Check expiry (Force UTC interpretation to avoid timezone offsets)
    const storedExpiry = otpRecord.expires_at;
    const expiryStr = storedExpiry.endsWith('Z') ? storedExpiry : `${storedExpiry}Z`;
    const expiry = new Date(expiryStr);
    const now = new Date();
    
    console.log(`⏱️ Expiry Check [UTC] — Stored: ${expiry.toISOString()}, Current: ${now.toISOString()}`);

    if (expiry < now) {
      console.warn(`⏳ OTP expired for: ${email}`);
      return res.status(400).json({ success: false, message: 'Verification code has expired.' });
    }

    // Check OTP hash
    const isValid = await verifyOTP(otp, otpRecord.otp_hash);
    if (!isValid) {
      console.warn(`❌ Invalid OTP entered for: ${email}`);
      
      // Increment attempts counter
      await supabase
        .from('otps')
        .update({ attempts: otpRecord.attempts + 1 })
        .eq('email', email.toLowerCase());

      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    // If valid:
    console.log(`✅ OTP verified! Finalizing user: ${email}`);

    // 1. Mark user as verified in 'users' table
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({ is_verified: true })
      .eq('email', email.toLowerCase());

    if (userUpdateError) {
      console.error('❌ FAILED to update user verification status:', userUpdateError.message);
      return res.status(500).json({ success: false, message: 'Failed to complete verification.' });
    }

    // 2. Delete OTP record from 'otps' table
    await supabase.from('otps').delete().eq('email', email.toLowerCase());

    console.log(`🎉 Account verified and persistent: ${email}`);
    res.status(200).json({ success: true, message: 'Email verified successfully! You can now log in.' });

  } catch (err) {
    console.error('[Verify OTP Error]', err);
    res.status(500).json({ success: false, message: 'Server error during verification' });
  }
};

