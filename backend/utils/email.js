const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const brandColor = '#C0392B';
const brandName  = 'Blood Bank';

const wrapEmail = (body) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; color: #333; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5; padding: 40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#C0392B,#922B21); padding:32px 40px; text-align:center;">
            <div style="font-size:40px; margin-bottom:8px;">🩸</div>
            <div style="color:#fff; font-size:22px; font-weight:700; letter-spacing:-0.5px;">${brandName}</div>
            <div style="color:rgba(255,255,255,0.7); font-size:13px; margin-top:4px;">Blood Bank Management System</div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#fafafa; border-top:1px solid #eee; padding:24px 40px; text-align:center;">
            <p style="font-size:12px; color:#999; line-height:1.6;">
              This email was sent by <strong style="color:${brandColor};">${brandName}</strong>.<br />
              If you didn't request this, please ignore this email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

/**
 * Send OTP verification email
 */
const sendOTPEmail = async (email, name, otp) => {
  const transporter = createTransporter();
  const body = `
    <h2 style="color:#111; font-size:22px; margin-bottom:8px;">Verify your email address</h2>
    <p style="color:#555; font-size:15px; margin-bottom:28px; line-height:1.6;">
      Hi <strong>${name}</strong>, use the OTP below to verify your email address. This code expires in <strong>10 minutes</strong>.
    </p>

    <div style="text-align:center; margin:28px 0;">
      <div style="display:inline-block; background:#fff5f5; border:2px dashed ${brandColor}; border-radius:12px; padding:20px 40px;">
        <div style="font-size:40px; font-weight:800; letter-spacing:12px; color:${brandColor}; font-family:monospace;">${otp}</div>
      </div>
    </div>

    <p style="color:#888; font-size:13px; text-align:center; margin-top:16px;">
      Do not share this code with anyone.
    </p>

    <div style="margin-top:32px; padding:16px; background:#fff9f9; border-left:4px solid ${brandColor}; border-radius:4px;">
      <p style="font-size:13px; color:#666;">
        🛡️ <strong>Security tip:</strong> The Blood Bank team will never ask for your OTP over the phone or email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `Blood Bank <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${otp} is your Blood Bank verification code`,
    html: wrapEmail(body),
  });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, name, resetUrl) => {
  const transporter = createTransporter();
  const body = `
    <h2 style="color:#111; font-size:22px; margin-bottom:8px;">Reset your password</h2>
    <p style="color:#555; font-size:15px; margin-bottom:28px; line-height:1.6;">
      Hi <strong>${name}</strong>, we received a request to reset your password. Click the button below to create a new password.
      This link expires in <strong>1 hour</strong>.
    </p>

    <div style="text-align:center; margin:32px 0;">
      <a href="${resetUrl}" style="display:inline-block; background:linear-gradient(135deg,${brandColor},#922B21); color:#fff; text-decoration:none; padding:14px 36px; border-radius:8px; font-size:15px; font-weight:600; box-shadow:0 4px 16px rgba(192,57,43,0.3);">
        Reset Password →
      </a>
    </div>

    <p style="color:#999; font-size:13px; text-align:center;">
      Or copy this link:<br />
      <a href="${resetUrl}" style="color:${brandColor}; word-break:break-all; font-size:12px;">${resetUrl}</a>
    </p>

    <div style="margin-top:32px; padding:16px; background:#fff9f9; border-left:4px solid ${brandColor}; border-radius:4px;">
      <p style="font-size:13px; color:#666;">
        ⚠️ If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `Blood Bank <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset your Blood Bank password',
    html: wrapEmail(body),
  });
};

module.exports = { sendOTPEmail, sendPasswordResetEmail };
