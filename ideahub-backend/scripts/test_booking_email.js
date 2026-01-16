
import dotenv from 'dotenv';
import sendEmail from '../src/utils/sendEmail.js';

dotenv.config();

const testApprovalEmail = async () => {
    // 1. Mock Data
    const dummyUser = {
        name: "Test User",
        email: process.env.EMAIL_USER, // Send to yourself to verify
    };

    const dummyBooking = {
        slotDate: "2026-02-01",
        startTime: "10:00",
        endTime: "12:00",
        reason: "Approved via automated test",
        team: dummyUser
    };

    const dummyRoom = {
        name: "Conference Room A"
    };

    console.log(`Sending test approval email to: ${dummyUser.email}...`);

    // 2. Simulate the Logic from bookingController.js
    try {
        await sendEmail(
            dummyUser.email,
            'Booking Approved - Idea Lab TEST',
            `<h2>Good news, ${dummyUser.name}!</h2>
             <p>Your booking for <b>${dummyRoom.name}</b> on ${dummyBooking.slotDate} (${dummyBooking.startTime} - ${dummyBooking.endTime}) has been approved.</p>
             <p><b>Reason/Note:</b> ${dummyBooking.reason}</p>
             <p>Please present the QR code in your dashboard upon entry.</p>
             <br/>
             <p>Regards,<br/>Idea Lab Team</p>`
        );
        console.log("✅ Test email sent successfully.");
    } catch (error) {
        console.error("❌ Failed to send test email.", error);
    }
};

testApprovalEmail();
