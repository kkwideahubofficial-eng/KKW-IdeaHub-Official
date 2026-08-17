import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToDatabase } from '../src/config/db.js';

import Room from '../src/models/Room.js';
import User from '../src/models/User.js';
import RoomPermissionRequest from '../src/models/RoomPermissionRequest.js';
import Event from '../src/models/Event.js';
import EventRegistration from '../src/models/EventRegistration.js';
import Booking from '../src/models/Booking.js';
import Material from '../src/models/Material.js';
import Product from '../src/models/Product.js';
import Order from '../src/models/Order.js';
import HeroImage from '../src/models/HeroImage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const roomsData = [
  {
    name: "AICTE IDEA Lab Main Lab",
    capacity: 50,
    features: ["3D Printer", "Laser Cutter", "Workbenches", "Computers", "Soldering Station"],
    isSpecial: true,
    description: "The main prototyping and hands-on fabrication space of the AICTE IDEA Lab.",
    timeSlots: [
      { startTime: "09:00", endTime: "11:00", label: "Morning Session 1" },
      { startTime: "11:00", endTime: "13:00", label: "Morning Session 2" },
      { startTime: "14:00", endTime: "16:00", label: "Afternoon Session 1" },
      { startTime: "16:00", endTime: "18:00", label: "Afternoon Session 2" }
    ]
  },
  {
    name: "Embedded Systems & IoT Lab",
    capacity: 20,
    features: ["Microcontrollers", "Oscilloscopes", "Soldering Stations", "Sensors"],
    isSpecial: true,
    description: "Dedicated space for designing, coding, and testing smart electronic systems.",
    timeSlots: [
      { startTime: "09:00", endTime: "11:00", label: "Morning Session 1" },
      { startTime: "11:00", endTime: "13:00", label: "Morning Session 2" },
      { startTime: "14:00", endTime: "16:00", label: "Afternoon Session 1" },
      { startTime: "16:00", endTime: "18:00", label: "Afternoon Session 2" }
    ]
  },
  {
    name: "CAD/CAM Prototyping Center",
    capacity: 15,
    features: ["High-end Workstations", "CAD/CAM Software", "3D Scanners"],
    isSpecial: true,
    description: "Workstations equipped with software for design, modeling, and simulation.",
    timeSlots: [
      { startTime: "09:00", endTime: "11:00", label: "Morning Session 1" },
      { startTime: "11:00", endTime: "13:00", label: "Morning Session 2" },
      { startTime: "14:00", endTime: "16:00", label: "Afternoon Session 1" },
      { startTime: "16:00", endTime: "18:00", label: "Afternoon Session 2" }
    ]
  },
  {
    name: "Discussion Room",
    capacity: 8,
    features: ["Whiteboard", "Projector", "Conference Table"],
    isSpecial: false,
    description: "Small meeting room for collaborative project discussions and brainstorming.",
    timeSlots: [
      { startTime: "09:00", endTime: "11:00", label: "Morning Session 1" },
      { startTime: "11:00", endTime: "13:00", label: "Morning Session 2" },
      { startTime: "14:00", endTime: "16:00", label: "Afternoon Session 1" },
      { startTime: "16:00", endTime: "18:00", label: "Afternoon Session 2" }
    ]
  }
];

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectToDatabase(process.env.MONGO_URI);
    console.log('Connected!');

    // 1. Seed Rooms
    console.log('Clearing old rooms...');
    await Room.deleteMany({});
    console.log(`Seeding ${roomsData.length} rooms...`);
    const seededRooms = await Room.insertMany(roomsData);
    console.log('Rooms seeded successfully!');

    // 1.5 Seed Events (Currently Ongoing)
    console.log('Clearing old events...');
    await Event.deleteMany({});

    const daysAgo = (num) => {
      const d = new Date();
      d.setDate(d.getDate() - num);
      return d;
    };

    const getFormattedTime = (date) => {
      let hours = date.getHours();
      let minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      return `${hours}:${minutes} ${ampm}`;
    };

    const startTimeDate = new Date();
    startTimeDate.setHours(startTimeDate.getHours() - 1);
    const endTimeDate = new Date();
    endTimeDate.setHours(endTimeDate.getHours() + 3);

    console.log('Seeding currently ongoing event...');
    await Event.create({
      title: "IoT Solutions & Smart Prototyping Hackathon",
      category: "Workshop",
      description: "An intensive hands-on event for building and prototyping IoT edge devices and sensors using IDEA Lab tools.",
      objectives: "1. Learn ESP32 & Arduino interfacing.\n2. Design custom PCBs.\n3. Integrate cloud telemetry.",
      date: startTimeDate,
      startTime: getFormattedTime(startTimeDate),
      endTime: getFormattedTime(endTimeDate),
      registrationStartDate: daysAgo(7),
      registrationEndDate: daysAgo(1),
      venue: "AICTE IDEA Lab Main Lab",
      building: "Main Tech Campus",
      roomNumber: "Lab 102",
      participationType: "Both Allowed",
      minTeamSize: 1,
      maxTeamSize: 4,
      totalSeats: 30,
      organizer: "AICTE IDEA Lab Committee",
      coordinatorName: "Prof. G. N. Jadhav",
      coordinatorContact: "9823456789",
      imageUrl: "/uploads/hackathon_event.jpg"
    });
    console.log('Ongoing event seeded successfully!');

    // 2. Clear old room requests
    console.log('Clearing old room permission requests...');
    await RoomPermissionRequest.deleteMany({});

    // 3. Find seeded students
    const s1 = await User.findOne({ email: 'srsarnaik370124@kkwagh.edu.in' });
    const s2 = await User.findOne({ email: 'aptandale370124@kkwagh.edu.in' });
    const s3 = await User.findOne({ email: 'rvgaikwad370124@kkwagh.edu.in' });
    const s4 = await User.findOne({ email: 'rbsankpal370124@kkwagh.edu.in' });
    const s5 = await User.findOne({ email: 'gmsarde370224@kkwagh.edu.in' });

    if (!s1 || !s2 || !s3 || !s4 || !s5) {
      console.error('Seeded students not found. Please run seedHeadData.js first.');
      process.exit(1);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // 3.1 Seed Materials (for stats like Allocated quantity and Low stock alerts)
    console.log('Clearing old materials...');
    await Material.deleteMany({});
    console.log('Seeding materials...');
    await Material.create([
      {
        name: 'PLA Filament (1kg Roll)',
        category: '3D Printing',
        description: 'Standard 1.75mm PLA Filament for FDM 3D Printers.',
        currentStock: 15,
        allocatedQuantity: 4,
        lowStockThreshold: 3,
        unit: 'rolls',
        imageUrl: 'https://images.unsplash.com/photo-1615840287214-7fe58a8b668f?auto=format&fit=crop&q=80&w=400',
      },
      {
        name: 'ABS Filament (1kg Roll)',
        category: '3D Printing',
        description: 'Tough 1.75mm ABS Filament for 3D printing heat-resistant prototypes.',
        currentStock: 1,
        allocatedQuantity: 0,
        lowStockThreshold: 2,
        unit: 'rolls',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400',
      },
      {
        name: 'ESP32 Development Board',
        category: 'Electronics',
        description: 'Wi-Fi & Bluetooth integrated microcontroller for IoT applications.',
        currentStock: 4,
        allocatedQuantity: 1,
        lowStockThreshold: 5,
        unit: 'pcs',
        imageUrl: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&q=80&w=400',
      },
      {
        name: 'Acrylic Sheet (3mm A4)',
        category: 'Laser Cutting',
        description: 'Clear Acrylic sheet suitable for laser cutter fabrication.',
        currentStock: 40,
        allocatedQuantity: 0,
        lowStockThreshold: 10,
        unit: 'sheets',
        imageUrl: 'https://images.unsplash.com/photo-1590483736622-39da8a77ffce?auto=format&fit=crop&q=80&w=400',
      }
    ]);
    console.log('Materials seeded successfully!');

    // 3.2 Seed Bookings (Room Bookings)
    console.log('Clearing old bookings...');
    await Booking.deleteMany({});
    console.log('Seeding bookings...');
    await Booking.create([
      {
        team: s1._id,
        room: seededRooms[0]._id,
        teamSize: 3,
        slotDate: todayStr,
        startTime: "09:00",
        endTime: "11:00",
        purpose: "Chassis 3D printing session",
        teamName: "Robotics Explorers",
        status: "pending"
      },
      {
        team: s2._id,
        room: seededRooms[1]._id,
        teamSize: 2,
        slotDate: todayStr,
        startTime: "11:00",
        endTime: "13:00",
        purpose: "Sensor calibration and wiring",
        teamName: "SmartAgri Team",
        status: "approved"
      },
      {
        team: s3._id,
        room: seededRooms[2]._id,
        teamSize: 1,
        slotDate: todayStr,
        startTime: "14:00",
        endTime: "16:00",
        purpose: "CAD design polishing for competition",
        teamName: "Solo Designer",
        status: "rejected",
        reason: "Facility booked for another workshop"
      }
    ]);
    console.log('Bookings seeded successfully!');

    // 3.3 Seed Products & Orders (Manage Orders page)
    console.log('Clearing old products and orders...');
    await Product.deleteMany({});
    await Order.deleteMany({});

    console.log('Seeding products...');
    const seededProducts = await Product.create([
      {
        title: "AICTE IDEA Lab Custom T-Shirt",
        price: 299,
        description: "Official cotton T-shirt.",
        category: "Merchandise",
        stock: 50,
        imageUrl: "https://placehold.co/400x400"
      },
      {
        title: "Arduino UNO Starter Kit",
        price: 999,
        description: "All in one kit for prototyping.",
        category: "Electronics",
        stock: 20,
        imageUrl: "https://placehold.co/400x400"
      },
      {
        title: "3D Printed Pen Holder",
        price: 149,
        description: "Stylish desk organiser.",
        category: "Custom 3D Prints",
        stock: 15,
        imageUrl: "https://placehold.co/400x400"
      }
    ]);

    console.log('Seeding orders...');
    await Order.create([
      {
        userId: s1._id,
        items: [{
          productId: seededProducts[0]._id,
          name: seededProducts[0].title,
          price: seededProducts[0].price,
          quantity: 1
        }],
        shippingAddress: {
          fullName: s1.name,
          addressLine1: "123 Campus Lane",
          city: "Nashik",
          state: "Maharashtra",
          postalCode: "422003",
          phone: "9876543210"
        },
        paymentInfo: {
          provider: 'cod',
          status: 'pending'
        },
        amounts: {
          subtotal: 299,
          total: 299
        },
        status: 'PENDING'
      },
      {
        userId: s2._id,
        items: [{
          productId: seededProducts[1]._id,
          name: seededProducts[1].title,
          price: seededProducts[1].price,
          quantity: 1
        }],
        shippingAddress: {
          fullName: s2.name,
          addressLine1: "456 Hostel Block B",
          city: "Nashik",
          state: "Maharashtra",
          postalCode: "422003",
          phone: "9876543211"
        },
        paymentInfo: {
          provider: 'razorpay',
          status: 'completed',
          paymentId: 'pay_123456789'
        },
        amounts: {
          subtotal: 999,
          total: 999
        },
        status: 'PROCESSING'
      },
      {
        userId: s3._id,
        items: [{
          productId: seededProducts[2]._id,
          name: seededProducts[2].title,
          price: seededProducts[2].price,
          quantity: 2
        }],
        shippingAddress: {
          fullName: s3.name,
          addressLine1: "789 College Road",
          city: "Nashik",
          state: "Maharashtra",
          postalCode: "422005",
          phone: "9876543212"
        },
        paymentInfo: {
          provider: 'razorpay',
          status: 'completed',
          paymentId: 'pay_987654321'
        },
        amounts: {
          subtotal: 298,
          total: 298
        },
        status: 'DELIVERED'
      }
    ]);
    console.log('Products and Orders seeded successfully!');

    // 3.4 Seed Hero Images for homepage slider
    console.log('Clearing old hero images...');
    await HeroImage.deleteMany({});
    console.log('Seeding hero images...');
    await HeroImage.create([
      {
        secure_url: '/uploads/hero_lab_1.jpg',
        public_id: 'hero_lab_1',
        order: 0,
        isActive: true
      },
      {
        secure_url: '/uploads/hero_lab_2.jpg',
        public_id: 'hero_lab_2',
        order: 1,
        isActive: true
      },
      {
        secure_url: '/uploads/hero_lab_3.jpg',
        public_id: 'hero_lab_3',
        order: 2,
        isActive: true
      }
    ]);
    console.log('Hero images seeded successfully!');

    // Request 1: Pending (Submitted)
    const req1 = await RoomPermissionRequest.create({
      requestId: "RPR-SEED-001",
      facilityRequired: "AICTE IDEA Lab Main Lab",
      purpose: "Fabrication of chassis for robotic arm prototype",
      category: "Prototype Development",
      applicantDetails: {
        requestedBy: s1._id,
        applicantName: s1.name,
        prn: s1.prn || "37012401",
        rollNo: "TE-CSE-01",
        department: s1.branch || "Computer Engineering",
        year: s1.year || "TE",
        division: s1.division || "A",
        mobile: s1.mobile || "9876543210",
        email: s1.email
      },
      teamDetails: {
        teamName: "Robotics Explorers",
        projectName: "Robotic Arm Prototyping",
        participantsCount: 3,
        teamMembers: [
          { fullName: s1.name, prn: "37012401", department: "Computer Engineering", year: "TE" },
          { fullName: "Ayush Tandale", prn: "37012402", department: "Computer Engineering", year: "TE" }
        ]
      },
      schedule: {
        requestedDate: todayStr,
        startTime: "09:00",
        endTime: "11:00",
        duration: 2
      },
      facultyRecommendation: {
        facultyName: "Dr. D. V. Medhane",
        facultyDepartment: "Computer Engineering",
        facultyMobile: "9823456789",
        facultyEmail: "dvmedhane@kkwagh.edu.in",
        facultyDesignation: "Professor",
        facultyRemarks: "Recommended for prototype fabrication",
        verified: true,
        verifiedAt: new Date()
      },
      status: "Submitted"
    });
    console.log('Created pending room request RPR-SEED-001 (Awaiting review)');

    // Request 2: Approved
    const req2 = await RoomPermissionRequest.create({
      requestId: "RPR-SEED-002",
      facilityRequired: "Embedded Systems & IoT Lab",
      purpose: "Sensor integration and testing for smart agriculture project",
      category: "Research Activity",
      applicantDetails: {
        requestedBy: s2._id,
        applicantName: s2.name,
        prn: s2.prn || "37012402",
        rollNo: "TE-CSE-02",
        department: s2.branch || "Computer Engineering",
        year: s2.year || "TE",
        division: s2.division || "A",
        mobile: s2.mobile || "9876543211",
        email: s2.email
      },
      teamDetails: {
        teamName: "SmartAgri Team",
        projectName: "Smart Agriculture Monitoring",
        participantsCount: 2,
        teamMembers: [
          { fullName: s2.name, prn: "37012402", department: "Computer Engineering", year: "TE" }
        ]
      },
      schedule: {
        requestedDate: todayStr,
        startTime: "11:00",
        endTime: "13:00",
        duration: 2
      },
      facultyRecommendation: {
        facultyName: "Prof. G. N. Jadhav",
        facultyDepartment: "Electrical Engineering",
        facultyMobile: "9823456780",
        facultyEmail: "gnjadhav@kkwagh.edu.in",
        facultyDesignation: "Assistant Professor",
        facultyRemarks: "Student has completed safety training",
        verified: true,
        verifiedAt: new Date()
      },
      status: "Approved",
      approvalHistory: [
        {
          date: new Date(),
          role: "Coordinator",
          action: "Approved",
          remarks: "Approved for IoT testing session",
          byName: "Coordinator"
        }
      ]
    });
    console.log('Created approved room request RPR-SEED-002');

    // Request 3: Rejected
    const req3 = await RoomPermissionRequest.create({
      requestId: "RPR-SEED-003",
      facilityRequired: "CAD/CAM Prototyping Center",
      purpose: "Gaming tournament preparation",
      category: "Other",
      applicantDetails: {
        requestedBy: s3._id,
        applicantName: s3.name,
        prn: s3.prn || "37012403",
        rollNo: "TE-CSE-03",
        department: s3.branch || "Computer Engineering",
        year: s3.year || "TE",
        division: s3.division || "A",
        mobile: s3.mobile || "9876543212",
        email: s3.email
      },
      teamDetails: {
        teamName: "Esports Club",
        projectName: "Tournament Practice",
        participantsCount: 5,
        teamMembers: [
          { fullName: s3.name, prn: "37012403", department: "Computer Engineering", year: "TE" }
        ]
      },
      schedule: {
        requestedDate: todayStr,
        startTime: "14:00",
        endTime: "16:00",
        duration: 2
      },
      facultyRecommendation: {
        facultyName: "Prof. P. B. Surwade",
        facultyDepartment: "Mechanical Engineering",
        facultyMobile: "9823456781",
        facultyEmail: "pbsurwade@kkwagh.edu.in",
        facultyDesignation: "Assistant Professor",
        facultyRemarks: "Non-academic activity, please review policy",
        verified: true,
        verifiedAt: new Date()
      },
      status: "Rejected",
      remarks: "Facility is reserved only for innovation/academic prototyping work.",
      approvalHistory: [
        {
          date: new Date(),
          role: "Coordinator",
          action: "Rejected",
          remarks: "Facility is reserved only for innovation/academic prototyping work.",
          byName: "Coordinator"
        }
      ]
    });
    console.log('Created rejected room request RPR-SEED-003');

    // Request 4: Pending (Submitted)
    const req4 = await RoomPermissionRequest.create({
      requestId: "RPR-SEED-004",
      facilityRequired: "Discussion Room",
      purpose: "SIH Hackathon project brainstorming and planning",
      category: "Team Meeting",
      applicantDetails: {
        requestedBy: s4._id,
        applicantName: s4.name,
        prn: s4.prn || "37012404",
        rollNo: "TE-CSE-04",
        department: s4.branch || "Computer Engineering",
        year: s4.year || "TE",
        division: s4.division || "A",
        mobile: s4.mobile || "9876543213",
        email: s4.email
      },
      teamDetails: {
        teamName: "CodeCrafters",
        projectName: "Hackathon Prep",
        participantsCount: 4,
        teamMembers: [
          { fullName: s4.name, prn: "37012404", department: "Computer Engineering", year: "TE" }
        ]
      },
      schedule: {
        requestedDate: todayStr,
        startTime: "16:00",
        endTime: "18:00",
        duration: 2
      },
      facultyRecommendation: {
        facultyName: "Prof. S.T. Patil",
        facultyDepartment: "Computer Engineering",
        facultyMobile: "9823456782",
        facultyEmail: "stpatil@kkwagh.edu.in",
        facultyDesignation: "Assistant Professor",
        facultyRemarks: "SIH team meeting",
        verified: true,
        verifiedAt: new Date()
      },
      status: "Submitted"
    });
    console.log('Created pending room request RPR-SEED-004 (Awaiting review)');

    // 4. Seed Event Registrations
    console.log('Clearing old event registrations...');
    await EventRegistration.deleteMany({});

    console.log('Finding seeded event...');
    const seededEvent = await Event.findOne({ title: "IoT Solutions & Smart Prototyping Hackathon" });
    if (!seededEvent) {
      console.error('Seeded event not found.');
      process.exit(1);
    }

    console.log('Seeding event registrations...');
    // Registration 1: Pending (Individual - S. R. Sarnaik)
    await EventRegistration.create({
      event: seededEvent._id,
      student: s1._id,
      registrationId: "REG-2026-001",
      status: "pending",
      teamName: "Solo Prototyper",
      teamSize: 1,
      projectTitle: "Smart Greenhouse",
      problemStatement: "Need microclimate monitoring for crop yields",
      projectDescription: "Using ESP32 and DHT22 to log telemetry via MQTT.",
      skills: "Arduino, IoT, C++",
      declarationConfirmed: true,
      teamMembers: [
        {
          fullName: s1.name,
          prn: s1.prn || "37012401",
          rollNumber: "TE-CSE-01",
          department: s1.branch || "Computer Engineering",
          year: s1.year || "TE",
          division: s1.division || "A",
          email: s1.email,
          mobile: s1.mobile || "9876543210",
          isTeamLeader: true,
          attendance: "pending"
        }
      ]
    });

    // Registration 2: Pending (Team - Ayush Tandale & Rohan Gaikwad)
    await EventRegistration.create({
      event: seededEvent._id,
      student: s2._id,
      registrationId: "REG-2026-002",
      status: "pending",
      teamName: "IoT Builders",
      teamSize: 2,
      projectTitle: "Auto Irrigation System",
      problemStatement: "Inefficient water usage in farms",
      projectDescription: "Automatic soil moisture monitoring system that toggles water pumps.",
      skills: "Embedded Systems, Sensors",
      declarationConfirmed: true,
      teamMembers: [
        {
          fullName: s2.name,
          prn: s2.prn || "37012402",
          rollNumber: "TE-CSE-02",
          department: s2.branch || "Computer Engineering",
          year: s2.year || "TE",
          division: s2.division || "A",
          email: s2.email,
          mobile: s2.mobile || "9876543211",
          isTeamLeader: true,
          attendance: "pending"
        },
        {
          fullName: s3.name,
          prn: s3.prn || "37012403",
          rollNumber: "TE-CSE-03",
          department: s3.branch || "Computer Engineering",
          year: s3.year || "TE",
          division: s3.division || "A",
          email: s3.email,
          mobile: s3.mobile || "9876543212",
          isTeamLeader: false,
          attendance: "pending"
        }
      ]
    });

    // Registration 3: Approved (Individual - Raj Sankpal, Present)
    await EventRegistration.create({
      event: seededEvent._id,
      student: s4._id,
      registrationId: "REG-2026-003",
      status: "approved",
      teamName: "Sankpal Tech",
      teamSize: 1,
      projectTitle: "Wearable Fall Detector",
      problemStatement: "Elderly safety and alert mechanism",
      projectDescription: "Accelerometers based wearable band notifying guardians on fall detection.",
      skills: "Microcontrollers, Electronics",
      declarationConfirmed: true,
      teamMembers: [
        {
          fullName: s4.name,
          prn: s4.prn || "37012404",
          rollNumber: "TE-CSE-04",
          department: s4.branch || "Computer Engineering",
          year: s4.year || "TE",
          division: s4.division || "A",
          email: s4.email,
          mobile: s4.mobile || "9876543213",
          isTeamLeader: true,
          attendance: "present"
        }
      ]
    });

    // Registration 4: Approved (Individual - Ganesh Sarde, Absent)
    await EventRegistration.create({
      event: seededEvent._id,
      student: s5._id,
      registrationId: "REG-2026-004",
      status: "approved",
      teamName: "Sarde ENTC",
      teamSize: 1,
      projectTitle: "Smart Solar Tracker",
      problemStatement: "Suboptimal solar panel efficiency",
      projectDescription: "Dual-axis solar tracking system using LDR sensors to maximize power.",
      skills: "ENTC, Hardware Design",
      declarationConfirmed: true,
      teamMembers: [
        {
          fullName: s5.name,
          prn: s5.prn || "37022401",
          rollNumber: "TE-ENTC-01",
          department: s5.branch || "ENTC",
          year: s5.year || "TE",
          division: s5.division || "A",
          email: s5.email,
          mobile: s5.mobile || "9876543214",
          isTeamLeader: true,
          attendance: "absent"
        }
      ]
    });
    console.log('Seeded 4 event registrations (2 pending, 2 approved/attending).');

    console.log('--- SEEDING COMPLETE ---');
    process.exit(0);

  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedDB();
