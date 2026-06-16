// backend/src/services/emailService.ts

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// ============================================
// CREATE TRANSPORTER FOR REAL EMAILS
// ============================================
let transporter: nodemailer.Transporter | null = null;

// Check if SMTP credentials exist
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 30000,
    });

    // Verify connection
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ SMTP connection error:', error);
        console.error('⚠️ Please check your SMTP credentials in .env');
        transporter = null;
      } else {
        console.log('✅ SMTP server ready - Sending REAL emails!');
        console.log(`📧 From: ${process.env.SMTP_SENDER_EMAIL || process.env.SMTP_USER}`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to initialize SMTP:', error);
    transporter = null;
  }
} else {
  console.error('❌ SMTP credentials not configured!');
  console.error('⚠️ Please set SMTP_USER and SMTP_PASS in .env');
  console.error('💡 For Gmail, use App Password: https://myaccount.google.com/apppasswords');
}

// ============================================
// SEND REAL EMAIL - NO MORE CONSOLE LOGGING
// ============================================
const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  try {
    // Check if transporter is ready
    if (!transporter) {
      console.error(`❌ Cannot send email to ${to} - SMTP not configured`);
      console.error(`📧 Would have sent: "${subject}" to ${to}`);
      return false;
    }

    // Validate email
    if (!to || !to.includes('@')) {
      console.error(`❌ Invalid email address: ${to}`);
      return false;
    }

    const mailOptions = {
      from: `"${process.env.SMTP_SENDER_NAME || 'Perfect Fitness Club'}" <${process.env.SMTP_SENDER_EMAIL || process.env.SMTP_USER}>`,
      to: to,
      subject: subject,
      html: html,
      text: html.replace(/<[^>]*>/g, ''), // Plain text version
    };

    console.log(`📧 Sending REAL email to: ${to}`);
    console.log(`📧 Subject: ${subject}`);

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    
    return true;
  } catch (error: any) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    
    // Helpful error messages
    if (error.code === 'EAUTH') {
      console.error('🔑 Authentication failed!');
      console.error('💡 For Gmail: Use App Password, not regular password');
      console.error('💡 Get App Password: https://myaccount.google.com/apppasswords');
    } else if (error.code === 'ESOCKET') {
      console.error('🌐 Connection error. Check internet and firewall.');
    } else if (error.code === 'ECONNECTION') {
      console.error('🔌 Cannot connect to SMTP server. Check SMTP_HOST and SMTP_PORT.');
    }
    
    return false;
  }
};

// ============================================
// ALL YOUR EXISTING TEMPLATE FUNCTIONS
// (Keep all your existing template functions exactly as they are)
// ============================================

// Sanitize string helper
const sanitizeString = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .trim();
};

const sanitizeHtml = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .trim();
};

// OTP Email Template
const getOTPTemplate = (otp: string, name: string) => {
  const sanitizedName = sanitizeString(name);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>OTP Verification</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; text-align: center; }
    .otp-code { font-size: 36px; font-weight: bold; color: #ef4444; letter-spacing: 5px; margin: 20px 0; padding: 15px; background: #f8f8f8; border-radius: 8px; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Perfect Fitness Club</h1></div>
    <div class="content">
      <h2>Hello ${sanitizedName},</h2>
      <p>Your verification code is:</p>
      <div class="otp-code">${otp}</div>
      <p>This code is valid for <strong>5 minutes</strong>.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
    <div class="footer"><p>&copy; 2025 Perfect Fitness Club. All rights reserved.</p></div>
  </div>
</body>
</html>
`;
};

// Welcome Email Template
const getWelcomeTemplate = (name: string) => {
  const sanitizedName = sanitizeString(name);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Welcome to Perfect Fitness Club</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>🎉 Welcome to Perfect Fitness Club!</h1></div>
    <div class="content">
      <h2>Hello ${sanitizedName},</h2>
      <p>Your membership has been successfully created at <strong>Perfect Fitness Club</strong>!</p>
      <p>You can now login to your account using your email address. A One-Time Password (OTP) will be sent to this email each time you login.</p>
      <p><strong>Features available to you:</strong></p>
      <ul>
        <li>🏋️ Track your fitness journey</li>
        <li>💆 Book wellness spa services</li>
        <li>📅 Manage your bookings</li>
        <li>🔄 Request membership renewals</li>
        <li>📱 Access member portal</li>
      </ul>
      <p>We're excited to have you as part of our fitness family!</p>
      <p>Best regards,<br><strong>Perfect Fitness Club Team</strong></p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Perfect Fitness Club. All rights reserved.</p>
      <p>Kolwadi, Maharashtra - 412110 </p> 
      <p>+91 87888 64345</p>
    </div>
  </div>
</body>
</html>
`;
};

// Membership Expiry Reminder Template
const getExpiryReminderTemplate = (name: string, planName: string, daysRemaining: number, expiryDate: Date) => {
  const sanitizedName = sanitizeString(name);
  const sanitizedPlanName = sanitizeString(planName);
  let subject = '';
  let message = '';
  let urgency = '';
  
  if (daysRemaining === 7) {
    subject = '⚠️ Your Gym Membership Expires in 7 Days';
    message = `Your membership will expire in 7 days on ${expiryDate.toLocaleDateString()}. Renew now to continue your fitness journey without interruption.`;
    urgency = 'low';
  } else if (daysRemaining === 3) {
    subject = '⏰ Your Gym Membership Expires in 3 Days';
    message = `Your membership expires in just 3 days on ${expiryDate.toLocaleDateString()}. Don't wait - renew today!`;
    urgency = 'medium';
  } else if (daysRemaining === 2) {
    subject = '⚠️ Your Gym Membership Expires in 2 Days';
    message = `Your membership expires in 2 days on ${expiryDate.toLocaleDateString()}. Please renew to avoid any disruption.`;
    urgency = 'high';
  } else if (daysRemaining === 1) {
    subject = '🚨 Your Gym Membership Expires TOMORROW!';
    message = `Your membership expires TOMORROW (${expiryDate.toLocaleDateString()}). Renew immediately to continue enjoying our facilities!`;
    urgency = 'critical';
  } else {
    subject = '❌ Your Gym Membership Has Expired';
    message = `Your membership has expired today (${expiryDate.toLocaleDateString()}). Please renew to reactivate your access.`;
    urgency = 'expired';
  }
  
  const urgencyColors = {
    low: '#3b82f6',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444',
    expired: '#dc2626'
  };
  
  const color = urgencyColors[urgency as keyof typeof urgencyColors] || '#ef4444';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #999; }
    .days { font-size: 48px; font-weight: bold; color: ${color}; text-align: center; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Perfect Fitness Club</h1>
    </div>
    <div class="content">
      <h2>Dear ${sanitizedName},</h2>
      ${daysRemaining >= 0 ? `<div class="days">${daysRemaining} ${daysRemaining === 1 ? 'DAY' : 'DAYS'} LEFT</div>` : ''}
      <p>${message}</p>
      <p><strong>Plan:</strong> ${sanitizedPlanName}</p>
      <p><strong>Expiry Date:</strong> ${expiryDate.toLocaleDateString()}</p>
      <p>Best regards,<br><strong>Perfect Fitness Club Team</strong></p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Perfect Fitness Club. All rights reserved.</p>
      <p>Kolwadi, Maharashtra - 412110 </p> 
      <p>+91 87888 64345</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Birthday Email Template
const getBirthdayTemplate = (name: string, age: number) => {
  const sanitizedName = sanitizeString(name);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Happy Birthday!</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; text-align: center; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #999; }
    .cake { font-size: 60px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎂 Happy Birthday!</h1>
    </div>
    <div class="content">
      <div class="cake">🎂 🎈 🎉</div>
      <h2>Dear ${sanitizedName},</h2>
      <p>Wishing you a very <strong>Happy Birthday</strong> from the entire team at <strong>Perfect Fitness Club</strong>!</p>
      ${age > 0 ? `<p>May your ${age}th year bring you good health, happiness, and success!</p>` : ''}
      <p>We are grateful to have you as a valued member of our fitness family.</p>
      <p>Best regards,<br><strong>Perfect Fitness Club Team</strong></p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Perfect Fitness Club. All rights reserved.</p>
      <p>Kolwadi, Maharashtra - 412110 </p> 
      <p>+91 87888 64345</p>
    </div>
  </div>
</body>
</html>
`;
};

// Booking Confirmation Email Template
const getBookingConfirmationTemplate = (name: string, serviceName: string, date: string, time: string) => {
  const sanitizedName = sanitizeString(name);
  const sanitizedService = sanitizeString(serviceName);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Booking Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #999; }
    .details { background: #f8f8f8; padding: 15px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1> Perfect Fitness Club</h1>
      <p>Booking Confirmation</p>
    </div>
    <div class="content">
      <h2>Hello ${sanitizedName},</h2>
      <p>Your wellness service has been successfully booked!</p>
      <div class="details">
        <p><strong>Service:</strong> ${sanitizedService}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Amount:</strong> Free for Members</p>
      </div>
      <p>Please arrive 10 minutes before your appointment.</p>
      <p>Best regards,<br><strong>Perfect Fitness Club Team</strong></p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Perfect Fitness Club. All rights reserved.</p>
      <p>Kolwadi, Maharashtra - 412110 </p> 
      <p>+91 87888 64345</p>
    </div>
  </div>
</body>
</html>
`;
};

// Cancellation Email Template
const getCancellationTemplate = (name: string, serviceName: string, date: string, time: string) => {
  const sanitizedName = sanitizeString(name);
  const sanitizedService = sanitizeString(serviceName);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Booking Cancelled</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #999; }
    .details { background: #f8f8f8; padding: 15px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Perfect Fitness Club</h1>
      <p>Booking Cancelled</p>
    </div>
    <div class="content">
      <h2>Hello ${sanitizedName},</h2>
      <p>Your booking has been successfully cancelled.</p>
      <div class="details">
        <p><strong>Service:</strong> ${sanitizedService}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
      </div>
      <p>No cancellation fee applied.</p>
      <p>We hope to see you again soon!</p>
      <p>Best regards,<br><strong>Perfect Fitness Club Team</strong></p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Perfect Fitness Club. All rights reserved.</p>
      <p>Kolwadi, Maharashtra - 412110 </p> 
      <p>+91 87888 64345</p>
    </div>
  </div>
</body>
</html>
`;
};

// Renewal Request Email Template
const getRenewalRequestTemplate = (name: string, planName: string, isAdmin: boolean = false, memberName?: string) => {
  const sanitizedName = sanitizeString(name);
  const sanitizedPlanName = sanitizeString(planName);
  const sanitizedMemberName = memberName ? sanitizeString(memberName) : '';
  const subject = isAdmin ? 'New Renewal Request Received' : 'Renewal Request Submitted Successfully';
  const greeting = isAdmin ? `Hello ${sanitizedName},` : `Dear ${sanitizedName},`;
  const message = isAdmin 
    ? `A new renewal request has been submitted by member ${sanitizedMemberName} for the ${sanitizedPlanName} plan. Please review and take action.`
    : `Your renewal request for the ${sanitizedPlanName} plan has been submitted successfully. Our admin will review your request and contact you shortly.`;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Perfect Fitness Club</h1></div>
    <div class="content">
      <h2>${greeting}</h2>
      <p>${message}</p>
      <p>Plan: <strong>${sanitizedPlanName}</strong></p>
      <p>Best regards,<br><strong>Perfect Fitness Club Team</strong></p>
    </div>
    <div class="footer"><p>&copy; 2025 Perfect Fitness Club. All rights reserved.</p></div>
  </div>
</body>
</html>
  `;
};

// Renewal Status Email Template
const getRenewalStatusTemplate = (name: string, planName: string, status: string, notes?: string) => {
  const sanitizedName = sanitizeString(name);
  const sanitizedPlanName = sanitizeString(planName);
  const sanitizedNotes = notes ? sanitizeString(notes) : '';
  const statusText = status === 'APPROVED' ? 'Approved' : 'Rejected';
  const statusColor = status === 'APPROVED' ? '#22c55e' : '#ef4444';
  const statusMessage = status === 'APPROVED' 
    ? 'Your renewal request has been approved! Please visit the gym to complete the payment.'
    : 'We regret to inform you that your renewal request has been rejected.';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Renewal Request ${statusText}</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #999; }
    .status { display: inline-block; padding: 8px 16px; background: ${statusColor}; color: white; border-radius: 8px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Perfect Fitness Club</h1></div>
    <div class="content">
      <h2>Dear ${sanitizedName},</h2>
      <p>Your renewal request for the <strong>${sanitizedPlanName}</strong> plan has been:</p>
      <div style="text-align: center; margin: 20px 0;">
        <span class="status">${statusText}</span>
      </div>
      <p>${statusMessage}</p>
      ${sanitizedNotes ? `<p><strong>Reason:</strong> ${sanitizedNotes}</p>` : ''}
      <p>Best regards,<br><strong>Perfect Fitness Club Team</strong></p>
    </div>
    <div class="footer"><p>&copy; 2025 Perfect Fitness Club. All rights reserved.</p></div>
  </div>
</body>
</html>
  `;
};

// Final Warning Email Template
const getFinalWarningTemplate = (name: string, expiryDate: Date) => {
  const sanitizedName = sanitizeString(name);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title> URGENT: Your Account Will Be Deleted in 2 Days</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #999; }
    .warning { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Perfect Fitness Club</h1></div>
    <div class="content">
      <h2>Dear ${sanitizedName},</h2>
      <div class="warning">
        <strong> URGENT: ACCOUNT DELETION WARNING</strong>
      </div>
      <p>Your membership expired on <strong>${expiryDate.toLocaleDateString()}</strong>. You have not renewed your membership yet.</p>
      <p><strong>If you do not renew your membership within the next 2 days, your account and all associated data will be permanently deleted from our system.</strong></p>
      <h3>To keep your account active:</h3>
      <ol>
        <li>Login to your account</li>
        <li>Submit a renewal request</li>
        <li>Complete the payment process</li>
      </ol>
      <p>Don't let your fitness journey end! Renew today to continue enjoying our facilities and services.</p>
      <p>Best regards,<br><strong>Perfect Fitness Club Team</strong></p>
    </div>
    <div class="footer"><p>&copy; 2025 Perfect Fitness Club. All rights reserved.</p></div>
  </div>
</body>
</html>
`;
};

// ============================================
// EXPORTED FUNCTIONS - These send REAL emails
// ============================================

export const sendOTPEmail = async (email: string, otp: string, name: string): Promise<boolean> => {
  const subject = 'Your OTP Verification Code';
  const html = getOTPTemplate(otp, name);
  return await sendEmail(email, subject, html);
};

export const sendWelcomeEmail = async (email: string, name: string): Promise<boolean> => {
  const subject = 'Welcome to Perfect Fitness Club!';
  const html = getWelcomeTemplate(name);
  return await sendEmail(email, subject, html);
};

export const sendMembershipExpiryReminder = async (email: string, name: string, planName: string, daysRemaining: number, expiryDate: Date): Promise<boolean> => {
  const subject = daysRemaining === 7 ? '⚠️ Your Gym Membership Expires in 7 Days' :
                  daysRemaining === 3 ? '⏰ Your Gym Membership Expires in 3 Days' :
                  daysRemaining === 2 ? '⚠️ Your Gym Membership Expires in 2 Days' :
                  daysRemaining === 1 ? '🚨 Your Gym Membership Expires TOMORROW!' :
                  '❌ Your Gym Membership Has Expired';
  const html = getExpiryReminderTemplate(name, planName, daysRemaining, expiryDate);
  return await sendEmail(email, subject, html);
};

export const sendBulkEmail = async (email: string, name: string, title: string, message: string): Promise<boolean> => {
  const sanitizedTitle = sanitizeString(title);
  const sanitizedMessage = sanitizeHtml(message);
  const sanitizedName = sanitizeString(name);
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${sanitizedTitle}</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Perfect Fitness Club</h1>
    </div>
    <div class="content">
      <h2>Hello ${sanitizedName},</h2>
      <h3 style="color: #ef4444;">${sanitizedTitle}</h3>
      <div style="white-space: pre-wrap; line-height: 1.6;">${sanitizedMessage}</div>
      <p style="margin-top: 20px;">Best regards,<br><strong>Perfect Fitness Club Team</strong></p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Perfect Fitness Club. All rights reserved.</p>
      <p>Kolwadi, Maharashtra - 412110 </p> 
      <p>+91 87888 64345</p>
    </div>
  </div>
</body>
</html>
  `;
  
  return await sendEmail(email, sanitizedTitle, html);
};

export const sendBirthdayEmail = async (email: string, name: string, age: number): Promise<boolean> => {
  const subject = `🎂 Happy Birthday, ${name}! 🎉`;
  const html = getBirthdayTemplate(name, age);
  return await sendEmail(email, subject, html);
};

export const sendRenewalRequestEmail = async (email: string, name: string, planName: string, memberName?: string): Promise<boolean> => {
  const isAdmin = !!memberName;
  const subject = isAdmin ? 'New Renewal Request Received' : 'Renewal Request Submitted Successfully';
  const html = getRenewalRequestTemplate(name, planName, isAdmin, memberName);
  return await sendEmail(email, subject, html);
};

export const sendRenewalStatusEmail = async (email: string, name: string, planName: string, status: string, notes?: string): Promise<boolean> => {
  const subject = `Renewal Request ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`;
  const html = getRenewalStatusTemplate(name, planName, status, notes);
  return await sendEmail(email, subject, html);
};

export const sendFinalWarningEmail = async (email: string, name: string, expiryDate: Date): Promise<boolean> => {
  const subject = '⚠️ URGENT: Your Account Will Be Deleted in 2 Days';
  const html = getFinalWarningTemplate(name, expiryDate);
  return await sendEmail(email, subject, html);
};

export const sendBookingConfirmationEmail = async (email: string, name: string, serviceName: string, date: string, time: string): Promise<boolean> => {
  const subject = 'Booking Confirmation - Perfect Fitness Club';
  const html = getBookingConfirmationTemplate(name, serviceName, date, time);
  return await sendEmail(email, subject, html);
};

export const sendCancellationEmail = async (email: string, name: string, serviceName: string, date: string, time: string): Promise<boolean> => {
  const subject = 'Booking Cancelled - Perfect Fitness Club';
  const html = getCancellationTemplate(name, serviceName, date, time);
  return await sendEmail(email, subject, html);
};