
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import Machinery from '../src/models/Machinery.js';
import MachineryRequest from '../src/models/MachineryRequest.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection Error:', err);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    try {
        console.log('Clearing old test data (optional - uncomment if needed)...');
        // await MachineryRequest.deleteMany({});
        // await Machinery.deleteMany({});
        
        // 1. Create Head User
        const headEmail = 'head@ideahub.com';
        let headUser = await User.findOne({ email: headEmail });
        if (!headUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('head1234', salt);
            headUser = await User.create({
                name: 'Dr. Head of Dept',
                email: headEmail,
                passwordHash: hashedPassword,
                role: 'head',
                department: 'Innovation',
                phone: '1234567890'
            });
            console.log('Created Head User:', headEmail);
        } else {
            console.log('Head User exists:', headEmail);
        }

        // 2. Create Student User
        const studentEmail = 'student@test.com';
        let studentUser = await User.findOne({ email: studentEmail });
        if (!studentUser) {
             const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('student1', salt);
            studentUser = await User.create({
                name: 'Alice Innovator',
                email: studentEmail,
                passwordHash: hashedPassword,
                role: 'team',
                teamName: 'Team Alpha',
                phone: '9876543210'
            });
             console.log('Created Student User:', studentEmail);
        } else {
             console.log('Student User exists:', studentEmail);
        }

        // 2.5 Create Coordinator User
        const coordEmail = 'coordinator@ideahub.com';
        let coordUser = await User.findOne({ email: coordEmail });
        if (!coordUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('coord1234', salt);
            coordUser = await User.create({
                name: 'Mr. Coordinator',
                email: coordEmail,
                passwordHash: hashedPassword,
                role: 'coordinator',
                phone: '1122334455'
            });
            console.log('Created Coordinator User:', coordEmail);
        } else {
            console.log('Coordinator User exists:', coordEmail);
        }

        // 3. Create Machinery
        let printer = await Machinery.findOne({ name: '3D Printer Pro X' });
        if (!printer) {
            printer = await Machinery.create({
                name: '3D Printer Pro X',
                description: 'High precision 3D printer for prototyping.',
                capacity: 1,
                isAvailable: true,
                createdBy: headUser._id,
                imageUrl: 'https://placehold.co/600x400',
                timeSlots: [
                    { day: 'Monday', startTime: '09:00', endTime: '17:00' },
                    { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
                    { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
                    { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
                    { day: 'Friday', startTime: '09:00', endTime: '17:00' }
                ]
            });
            console.log('Created Machinery: 3D Printer Pro X');
        } else {
            console.log('Machinery exists: 3D Printer Pro X');
        }

        // 4. Create Requests
        
        // Request A: Completed Yesterday
        const successReq = await MachineryRequest.create({
            machineryId: printer._id,
            studentId: studentUser._id,
            teamMembers: [{ name: 'Alice', branch: 'CSE', year: '3rd' }, { name: 'Bob', branch: 'ME', year: '3rd' }],
            usageDate: new Date(new Date().setDate(new Date().getDate() - 1)), // Yesterday
            startTime: '10:00',
            endTime: '12:00',
            purpose: 'Printing prototype for project X',
            consentAgreed: true,
            groupPhotoUrl: 'https://placehold.co/100x100',
            status: 'approved',
            approvedBy: headUser._id,
            actualEntryTime: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(10, 5), // Yesterday 10:05
            actualExitTime: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(12, 10), // Yesterday 12:10
        });
        console.log('Created Completed Request (Yesterday)');

        // Request B: Approved for Today (Not yet started)
        const todayReq = await MachineryRequest.create({
            machineryId: printer._id,
            studentId: studentUser._id,
            teamMembers: [{ name: 'Alice', branch: 'CSE', year: '3rd' }],
            usageDate: new Date(),
            startTime: '14:00',
            endTime: '15:00',
            purpose: 'Printing small part',
            consentAgreed: true,
            groupPhotoUrl: 'https://placehold.co/100x100',
            status: 'approved',
            approvedBy: headUser._id
        });
         console.log('Created Approved Request (Today)');

        // Request C: Pending
        const pendingReq = await MachineryRequest.create({
            machineryId: printer._id,
            studentId: studentUser._id,
            teamMembers: [{ name: 'Alice', branch: 'CSE', year: '3rd' }],
            usageDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
            startTime: '09:00',
            endTime: '10:00',
            purpose: 'Urgent printing',
            consentAgreed: true,
            groupPhotoUrl: 'https://placehold.co/100x100',
            status: 'pending'
        });
        console.log('Created Pending Request (Tomorrow)');

        console.log('--- SEEDING COMPLETE ---');
        console.log('Head Creds: head@ideahub.com / head1234');
        console.log('Student Creds: student@test.com / student1');
        process.exit(0);

    } catch (error) {
        console.error('Seed Error:', error);
        process.exit(1);
    }
};

seedData();
