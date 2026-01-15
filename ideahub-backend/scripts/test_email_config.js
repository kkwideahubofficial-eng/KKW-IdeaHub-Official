import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from backend root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

dotenv.config({ path: envPath });

console.log('--- Email Configuration Test ---');
console.log('Loading .env from:', envPath);
console.log('EMAIL_USER:', process.env.EMAIL_USER || '(Missing)');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '(Present)' : '(Missing)');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ ERROR: EMAIL_USER or EMAIL_PASS is missing in .env file.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const testEmail = async () => {
  try {
    console.log('Attempting to send test email to yourself...');
    const info = await transporter.sendMail({
      from: `"Test Script" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to self
      subject: 'Idea Lab: Test Email',
      text: 'If you receive this, your email configuration is correct!',
    });
    console.log('✅ Success! Message sent:', info.messageId);
  } catch (error) {
    console.error('❌ Authentication Failed:', error.message);
    if (error.responseCode === 535) {
      console.log('\n--- HOW TO FIX ---');
      console.log('1. Your password is likely incorrect or you are using your login password.');
      console.log('2. You MUST use a "App Password" if 2-Step Verification is on.');
      console.log('3. Go to: https://myaccount.google.com/security');
      console.log('4. Enable 2-Step Verification.');
      console.log('5. Search for "App Passwords".');
      console.log('6. Create one named "IdeaLab" and copy the 16-character code.');
      console.log('7. Update EMAIL_PASS in backend/.env with this code (no spaces).');
    }
  }
};

testEmail();
