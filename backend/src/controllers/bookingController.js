import QRCode from 'qrcode';
import { validationResult } from 'express-validator';
import Booking from '../models/Booking.js';

function timesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

export async function getAvailableSlots(req, res) {
  try {
    const { date } = req.query; // YYYY-MM-DD
    if (!date) return res.status(400).json({ message: 'date (YYYY-MM-DD) is required' });

    const approved = await Booking.find({ slotDate: date, status: 'approved' }).select('startTime endTime');
    return res.status(200).json({ booked: approved });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch slots', error: err.message });
  }
}

export async function createBooking(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { slotDate, startTime, endTime, purpose, description, teamName } = req.body;
    const teamId = req.user._id;

    // Check for time slot conflicts
    const conflicts = await Booking.find({
      slotDate,
      status: 'approved',
    });

    const hasOverlap = conflicts.some((b) => timesOverlap(startTime, endTime, b.startTime, b.endTime));
    if (hasOverlap) {
      return res.status(409).json({ 
        message: 'The selected time slot is already booked. Please choose a different time.' 
      });
    }

    // Create the booking with all provided fields
    const booking = await Booking.create({ 
      team: teamId,
      slotDate, 
      startTime, 
      endTime, 
      purpose,
      description: description || '',
      teamName: teamName || '',
      status: 'pending' // Ensure new bookings are set to pending
    });
    
    console.log('Booking created successfully:', booking);
    return res.status(201).json({ 
      message: 'Booking request submitted successfully',
      booking 
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create booking', error: err.message });
  }
}

export async function getPendingBookings(req, res) {
  try {
    let query = { status: 'pending' };
    
    // If user is not a coordinator, only show their own pending bookings
    if (req.user.role !== 'coordinator') {
      query.team = req.user._id;
    }
    
    console.log('Fetching pending bookings with query:', query); // Debug log
    
    const bookings = await Booking.find(query)
      .populate({
        path: 'team',
        select: 'name email teamName',
      })
      .sort({ createdAt: -1 }); // Show newest first
      
    console.log('Found bookings:', bookings.length); // Debug log
    return res.status(200).json({ bookings });
  } catch (err) {
    console.error('Error in getPendingBookings:', err);
    return res.status(500).json({ 
      message: 'Failed to fetch pending bookings', 
      error: err.message 
    });
  }
}

export async function decideBooking(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { decision, reason } = req.body; // decision: 'approved' | 'rejected'

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (decision === 'approved') {
      // final overlap check against approved
      const conflicts = await Booking.find({ slotDate: booking.slotDate, status: 'approved', _id: { $ne: booking._id } });
      const hasOverlap = conflicts.some((b) => timesOverlap(booking.startTime, booking.endTime, b.startTime, b.endTime));
      if (hasOverlap) return res.status(409).json({ message: 'Slot overlaps with an approved booking' });

      const payload = {
        bookingId: booking._id.toString(),
        team: booking.team.toString(),
        slotDate: booking.slotDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
      };
      const qrCode = await QRCode.toDataURL(JSON.stringify(payload));
      booking.status = 'approved';
      booking.reason = reason || '';
      booking.qrCode = qrCode;
      await booking.save();
    } else if (decision === 'rejected') {
      booking.status = 'rejected';
      booking.reason = reason || '';
      await booking.save();
    } else {
      return res.status(400).json({ message: 'Invalid decision' });
    }

    return res.status(200).json({ booking });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to decide booking', error: err.message });
  }
}

export async function getDashboardStats(req, res) {
  try {
    // For coordinators, show all stats
    // For team members, only show their own stats
    const query = req.user.role === 'coordinator' ? {} : { team: req.user._id };
    
    const [totalPending, totalApproved, totalRejected] = await Promise.all([
      Booking.countDocuments({ ...query, status: 'pending' }),
      Booking.countDocuments({ ...query, status: 'approved' }),
      Booking.countDocuments({ status: 'rejected' })
    ]);

    return res.status(200).json({
      stats: {
        totalPending,
        totalApproved,
        totalRejected
      },
      recentBookings: [] // We'll implement this later if needed
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch dashboard stats', error: err.message });
  }
}

export default { 
  getAvailableSlots, 
  createBooking, 
  getPendingBookings, 
  decideBooking,
  getDashboardStats 
};

