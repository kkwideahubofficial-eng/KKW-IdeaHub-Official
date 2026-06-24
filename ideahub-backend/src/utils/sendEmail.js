import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async (to, subject, htmlContent) => {
  try {
    console.log('--- sendEmail called ---');
    console.log('To:', to);
    console.log('From User:', process.env.EMAIL_USER); // Do not log password
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('ERROR: Missing EMAIL_USER or EMAIL_PASS in environment variables');
      return null;
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 10000, // 10 seconds timeout
      tls: {
        rejectUnauthorized: false
      }
    });

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
