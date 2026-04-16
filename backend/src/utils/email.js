const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to any SMTP provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends an OTP email to the user
 * @param {string} email - Recipient's email
 * @param {string} otp - 6-digit OTP
 */
const sendOTPEmail = async (email, name, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Blood Bank" <no-reply@bloodbank.com>',
    to: email,
    subject: 'Your Blood Bank Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #c0392b; text-align: center;">Blood Bank Verification</h2>
        <p>Hello ${name || 'User'},</p>
        <p>Your one-time password (OTP) for account verification is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #c0392b; border: 2px dashed #c0392b; padding: 10px 20px;">${otp}</span>
        </div>
        <p>This code will expire in 10 minutes. Please do not share this code with anyone.</p>
        <hr style="border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #777;">If you did not request this code, please ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw new Error('Failed to send verification email.');
  }
};

const crypto = require('crypto');

/**
 * Generates a secure 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const sendRequestAlert = async (adminEmail, requestData) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Blood Bee Alerts" <no-reply@bloodbank.com>',
    to: adminEmail,
    subject: `❗ EMERGENCY: New Blood Request (${requestData.blood_type})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1.5px solid #ff4d4d; border-radius: 12px;">
        <h2 style="color: #c0392b;">Urgent Blood Request Received</h2>
        <p>A new emergency blood request has been posted on the platform.</p>
        <div style="background: #fdf2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Patient Name:</strong> ${requestData.patient_name}</p>
          <p><strong>Blood Group Required:</strong> <span style="color: #c0392b; font-size: 1.2em;">${requestData.blood_type}</span></p>
          <p><strong>Units Required:</strong> ${requestData.units}</p>
          <p><strong>Hospital/Location:</strong> ${requestData.location}</p>
          <p><strong>Urgency Level:</strong> <span style="color: #c0392b;">${requestData.urgency}</span></p>
        </div>
        <p>Please log in to the <a href="${process.env.FRONTEND_URL}/admin/dashboard">Admin Panel</a> to fulfill this request.</p>
        <hr style="border: none; border-top: 1px solid #eee;">
        <p style="font-size: 11px; color: #999;">Automated Alert from Blood Bee System</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📢 Admin notified of new request');
  } catch (error) {
    console.error('⚠️ Failed to notify admin:', error.message);
  }
};

module.exports = {
  sendOTPEmail,
  generateOTP,
  sendRequestAlert
};
