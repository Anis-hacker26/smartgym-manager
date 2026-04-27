const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('Testing email with:');
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_PASS length:', process.env.SMTP_PASS?.length || 0);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    const info = await transporter.sendMail({
      from: `"Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to yourself
      subject: 'Test Email - Gym System',
      text: 'If you receive this, email is working!',
      html: '<h1>Test Successful!</h1><p>Your gym management system email is configured correctly.</p>'
    });
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    if (error.response?.includes('535')) {
      console.log('\n🔧 FIX: Invalid credentials. You need to:');
      console.log('1. Enable 2-Step Verification on your Google Account');
      console.log('2. Generate an App Password (not your regular password)');
      console.log('3. Use that 16-character password in SMTP_PASS');
      console.log('\n👉 Go to: https://myaccount.google.com/apppasswords\n');
    }
    return false;
  }
}

testEmail();