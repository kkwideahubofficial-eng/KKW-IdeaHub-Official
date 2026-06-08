
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

        // 2.1 Create Team Member User (Requested by User)
        const teamMemberEmail = 'teammember@gmail.com';
        let teamMemberUser = await User.findOne({ email: teamMemberEmail });
        if (!teamMemberUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('123456', salt);
            teamMemberUser = await User.create({
                name: 'Team Member',
                email: teamMemberEmail,
                passwordHash: hashedPassword,
                role: 'team',
                teamName: 'Team Beta',
                phone: '1234567890'
            });
            console.log('Created Team Member User:', teamMemberEmail);
        } else {
            // Update the password to ensure it is '123456'
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('123456', salt);
            teamMemberUser.passwordHash = hashedPassword;
            await teamMemberUser.save();
            console.log('Updated Team Member User password to 123456:', teamMemberEmail);
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
        
        // Clean up previously seeded requests to prevent duplicate key errors on re-run
        await MachineryRequest.deleteMany({ requestId: { $in: ['MAT-SEED-001', 'MAT-SEED-002', 'MAT-SEED-003', 'MAT-SEED-004', 'MAT-SEED-005'] } });

        // Request A: Completed Yesterday
        const successReq = await MachineryRequest.create({
            requestId: 'MAT-SEED-001',
            projectName: 'Prototype Printing',
            projectCategory: 'Academic Project',
            projectDescription: 'Printing prototype parts for robotics course',
            projectObjectives: 'Assemble working chassis',
            expectedOutcome: 'Robot chassis',
            machineryId: printer._id,
            studentId: studentUser._id,
            students: [{
                name: 'Alice Innovator',
                prn: 'PRN123456',
                branch: 'CSE',
                year: 'TE',
                division: 'A',
                mobile: '9876543210',
                email: 'student@test.com'
            }],
            teamMembers: [{ name: 'Alice', branch: 'CSE', year: '3rd' }, { name: 'Bob', branch: 'ME', year: '3rd' }],
            usageDate: new Date(new Date().setDate(new Date().getDate() - 1)), // Yesterday
            startTime: '10:00',
            endTime: '12:00',
            purpose: 'Printing prototype for project X',
            consentAgreed: true,
            groupPhotoUrl: 'https://placehold.co/100x100',
            status: 'Work Completed',
            approvedBy: headUser._id,
            actualEntryTime: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(10, 5), // Yesterday 10:05
            actualExitTime: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(12, 10), // Yesterday 12:10
        });
        console.log('Created Completed Request (Yesterday)');

        // Request B: Approved for Today (Not yet started)
        const todayReq = await MachineryRequest.create({
            requestId: 'MAT-SEED-002',
            projectName: 'Small Part Printing',
            projectCategory: 'Academic Project',
            projectDescription: 'Printing structural joiner',
            projectObjectives: 'Complete frame joint',
            expectedOutcome: 'Joint part',
            machineryId: printer._id,
            studentId: studentUser._id,
            students: [{
                name: 'Alice Innovator',
                prn: 'PRN123456',
                branch: 'CSE',
                year: 'TE',
                division: 'A',
                mobile: '9876543210',
                email: 'student@test.com'
            }],
            teamMembers: [{ name: 'Alice', branch: 'CSE', year: '3rd' }],
            usageDate: new Date(),
            startTime: '14:00',
            endTime: '15:00',
            purpose: 'Printing small part',
            consentAgreed: true,
            groupPhotoUrl: 'https://placehold.co/100x100',
            status: 'Approved',
            approvedBy: headUser._id
        });
         console.log('Created Approved Request (Today)');

        // Request C: Pending
        const pendingReq = await MachineryRequest.create({
            requestId: 'MAT-SEED-003',
            projectName: 'Urgent Printing Task',
            projectCategory: 'Academic Project',
            projectDescription: 'Fabricate custom enclosures',
            projectObjectives: 'House PCB boards securely',
            expectedOutcome: 'ABS housing box',
            machineryId: printer._id,
            studentId: studentUser._id,
            students: [{
                name: 'Alice Innovator',
                prn: 'PRN123456',
                branch: 'CSE',
                year: 'TE',
                division: 'A',
                mobile: '9876543210',
                email: 'student@test.com'
            }],
            teamMembers: [{ name: 'Alice', branch: 'CSE', year: '3rd' }],
            usageDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
            startTime: '09:00',
            endTime: '10:00',
            purpose: 'Urgent printing',
            consentAgreed: true,
            groupPhotoUrl: 'https://placehold.co/100x100',
            status: 'Submitted'
        });
        console.log('Created Pending Request (Tomorrow)');

        // Request D: PAST slot (8:00 AM - 8:05 AM today) - for testing completion reminder flow
        // This slot is already past, so the scheduler should send a completion reminder
        const scheduledReq = await MachineryRequest.create({
            requestId: 'MAT-SEED-004',
            projectName: 'Morning Robotics Print',
            projectCategory: 'Academic Project',
            projectDescription: 'Morning printing session for prototype assembly',
            projectObjectives: 'Finalize parts fabrication',
            expectedOutcome: 'Assembled prototype',
            machineryId: printer._id,
            studentId: studentUser._id,
            students: [{
                name: 'Alice Innovator',
                prn: 'PRN123456',
                branch: 'CSE',
                year: 'TE',
                division: 'A',
                mobile: '9876543210',
                email: 'student@test.com'
            }],
            teamMembers: [{ name: 'Alice', branch: 'CSE', year: '3rd' }],
            requestedMachines: [{
                machineId: printer._id,
                machineName: printer.name,
                usageDate: new Date(),
                startTime: '08:00',
                endTime: '08:05',
                usageHours: 0.08,
                purposeOfUsage: 'Morning printing run for prototype assembly'
            }],
            usageDate: new Date(),
            startTime: '08:00',
            endTime: '08:05',
            purpose: 'Morning printing run for prototype assembly',
            consentAgreed: true,
            groupPhotoUrl: 'https://placehold.co/100x100',
            status: 'Machine Scheduled',
            completionReminderSent: false,
            approvedBy: headUser._id
        });
        console.log('Created Scheduled Request (PAST: 8:00-8:05 AM today) for completion reminder testing');

        // Request E: 9:10 PM - 9:15 PM TODAY - Approved by coordinator and head (future slot, user-requested)
        const eveningReq = await MachineryRequest.create({
            requestId: 'MAT-SEED-005',
            projectName: 'Final Robotics Assembly',
            projectCategory: 'Academic Project',
            projectDescription: 'Final printing run for prototype assembly',
            projectObjectives: 'Finalize parts fabrication',
            expectedOutcome: 'Assembled prototype',
            machineryId: printer._id,
            studentId: studentUser._id,
            students: [{
                name: 'Alice Innovator',
                prn: 'PRN123456',
                branch: 'CSE',
                year: 'TE',
                division: 'A',
                mobile: '9876543210',
                email: 'student@test.com'
            }],
            teamMembers: [{ name: 'Alice', branch: 'CSE', year: '3rd' }],
            requestedMachines: [{
                machineId: printer._id,
                machineName: printer.name,
                usageDate: new Date(),
                startTime: '21:10',
                endTime: '21:15',
                usageHours: 0.08,
                purposeOfUsage: 'Final printing run for prototype assembly'
            }],
            usageDate: new Date(),
            startTime: '21:10',
            endTime: '21:15',
            purpose: 'Final printing run for prototype assembly',
            consentAgreed: true,
            groupPhotoUrl: 'https://placehold.co/100x100',
            status: 'Machine Scheduled',
            completionReminderSent: false,
            approvedBy: headUser._id
        });
        console.log('Created Scheduled Request (FUTURE: 9:10-9:15 PM today) - MAT-SEED-005');

        console.log('--- SEEDING COMPLETE ---');
        console.log('Head Creds:        head@ideahub.com / head1234');
        console.log('Student Creds:     student@test.com / student1');
        console.log('Team Member Creds: teammember@gmail.com / 123456');
        console.log('Coordinator Creds: coordinator@ideahub.com / coord1234');
        console.log('');
        console.log('MAT-SEED-004 => status: Machine Scheduled | slot: 8:00-8:05 AM TODAY (PAST - for completion reminder test)');
        console.log('MAT-SEED-005 => status: Machine Scheduled | slot: 9:10-9:15 PM TODAY (FUTURE - approved by coord+head)');
        process.exit(0);

    } catch (error) {
        console.error('Seed Error:', error);
        process.exit(1);
    }
};

seedData();
