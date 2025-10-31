import nodemailer from 'nodemailer';
import config from '../config/index.js';
import logger from '../config/logger.js';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export async function sendPasswordResetEmail(email, code, resetLink) {
  const mailOptions = {
    from: `"CareFlow EHR" <${config.smtp.user}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .code { font-size: 32px; font-weight: bold; color: #4F46E5; text-align: center; padding: 20px; background: white; border-radius: 5px; margin: 20px 0; letter-spacing: 5px; }
          .button { display: inline-block; padding: 12px 30px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset your password for your CareFlow EHR account.</p>
            
            <p><strong>Your verification code is:</strong></p>
            <div class="code">${code}</div>
            
            <p>Or click the button below to reset your password:</p>
            <center>
              <a href="${resetLink}" class="button">Reset Password</a>
            </center>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul>
                <li>This code expires in 15 minutes</li>
                <li>Never share this code with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
            
            <p>Best regards,<br>CareFlow EHR Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
            <p>&copy; ${new Date().getFullYear()} CareFlow EHR. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    logger.info(`Password reset email sent to ${email}`, { messageId: info.messageId });
    return true;
  } catch (error) {
    logger.error(`Failed to send email to ${email}`, { error: error.message, stack: error.stack });
    throw new Error('Failed to send email');
  }
}

export async function sendAppointmentReminderEmail(data) {
  const {
    email,
    patientName,
    doctorName,
    doctorSpecialization,
    appointmentDate,
    appointmentTime,
    appointmentType,
    meetingLink,
    reason
  } = data;

  const mailOptions = {
    from: `"CareFlow EHR" <${config.smtp.user}>`,
    to: email,
    subject: '🔔 Appointment Reminder - Tomorrow',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .appointment-card { background: white; border-left: 4px solid #10B981; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; width: 150px; color: #6B7280; }
          .detail-value { flex: 1; color: #111827; }
          .button { display: inline-block; padding: 12px 30px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .button-secondary { background: #6366F1; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .reminder-badge { background: #FEF3C7; color: #92400E; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 10px 0; }
          .virtual-badge { background: #DBEAFE; color: #1E40AF; padding: 5px 10px; border-radius: 5px; font-size: 12px; font-weight: bold; }
          .in-person-badge { background: #D1FAE5; color: #065F46; padding: 5px 10px; border-radius: 5px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Appointment Reminder</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${patientName}</strong>,</p>
            
            <div class="reminder-badge">
              ⏰ Your appointment is tomorrow!
            </div>
            
            <p>This is a friendly reminder about your upcoming appointment:</p>
            
            <div class="appointment-card">
              <div class="detail-row">
                <div class="detail-label">👨‍⚕️ Doctor:</div>
                <div class="detail-value">${doctorName}${doctorSpecialization ? ` - ${doctorSpecialization}` : ''}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">📅 Date:</div>
                <div class="detail-value">${appointmentDate}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">🕐 Time:</div>
                <div class="detail-value">${appointmentTime}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">📍 Type:</div>
                <div class="detail-value">
                  ${appointmentType === 'virtual' 
                    ? '<span class="virtual-badge">💻 Virtual Appointment</span>' 
                    : '<span class="in-person-badge">🏥 In-Person Visit</span>'}
                </div>
              </div>
              ${reason ? `
              <div class="detail-row">
                <div class="detail-label">📋 Reason:</div>
                <div class="detail-value">${reason}</div>
              </div>
              ` : ''}
            </div>
            
            ${appointmentType === 'virtual' && meetingLink ? `
            <p><strong>Virtual Appointment Link:</strong></p>
            <center>
              <a href="${meetingLink}" class="button">Join Virtual Meeting</a>
            </center>
            <p style="font-size: 12px; color: #6B7280;">💡 Tip: Test your camera and microphone before the appointment</p>
            ` : `
            <p><strong>📍 Please arrive 10 minutes early</strong> for check-in.</p>
            `}
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p><strong>Need to reschedule or cancel?</strong></p>
            <p style="font-size: 14px; color: #6B7280;">
              Please contact us at least 24 hours in advance or manage your appointment through your patient portal.
            </p>
            
            <p style="margin-top: 30px;">
              We look forward to seeing you!<br>
              <strong>CareFlow EHR Team</strong>
            </p>
          </div>
          <div class="footer">
            <p>This is an automated reminder. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} CareFlow EHR. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Appointment reminder sent to ${email}`, { messageId: info.messageId });
    return true;
  } catch (error) {
    logger.error(`Failed to send appointment reminder to ${email}`, { error: error.message });
    throw new Error('Failed to send appointment reminder');
  }
}
