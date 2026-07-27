import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter once to reuse connections (connection pooling)
// This is much faster and more reliable, especially on hosted environments
const transporter = nodemailer.createTransport({
  host: '142.250.115.108', // Hardcoded IP for smtp.gmail.com to completely bypass Windows/c-ares DNS timeout issues
  port: 465, // Use 465 for secure connection
  secure: true, 
  pool: true, // Use pooled connections
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 15000, 
  socketTimeout: 15000, 
  tls: {
    servername: 'smtp.gmail.com', // Necessary for SSL handshake when using direct IP
    rejectUnauthorized: false
  }
});

const sendEmail = async (to, subject, htmlContent) => {
  try {
    console.log('--- sendEmail called ---');
    console.log('To:', to);
    console.log('From User:', process.env.EMAIL_USER); // Do not log password
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('ERROR: Missing EMAIL_USER or EMAIL_PASS in environment variables');
      return null;
    }

    const info = await transporter.sendMail({
      from: `"Idea Lab" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw error to prevent crashing the main flow, just log it
    return null;
  }
};

export default sendEmail;
