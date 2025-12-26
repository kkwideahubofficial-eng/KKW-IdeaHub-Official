import QRCode from 'qrcode';
import { validationResult } from 'express-validator';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';

function timesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

export async function getRoomAvailability(req, res) {
  try {
    const { date } = req.query; // YYYY-MM-DD
    if (!date) return res.status(400).json({ message: 'date (YYYY-MM-DD) is required' });

    // FIX: 'rooms' was missing because I accidentally deleted it in previous edit
    const rooms = await Room.find({});

    // Get all approved/pending bookings for this date
    // We fetch PENDING too, so we can show "Demand" (Total Applied) stats
    const bookings = await Booking.find({ 
      slotDate: date, 
      status: { $in: ['approved', 'pending'] } 
    });

    // Calculate availability for each room
    const availability = rooms.map(room => {
      // Filter bookings for this room
      const roomBookings = bookings.filter(b => b.room.toString() === room._id.toString());
      
      return {
        ...room.toObject(),
        bookings: roomBookings.map(b => ({
          startTime: b.startTime,
          endTime: b.endTime,
          teamSize: b.teamSize,
          status: b.status // Include status for frontend stats
        }))
      };
    });

    return res.status(200).json(availability);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch room availability', error: err.message });
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

    const { slotDate, startTime, endTime, purpose, description, teamName, roomId, teamSize } = req.body;
    const teamId = req.user._id;
    
    // Validate time range
    if (startTime >= endTime) {
      return res.status(400).json({ 
        message: 'Invalid time range: Start Time must be strictly before End Time. If you meant 8 PM, please use 20:00.' 
      });
    }

    if (!roomId || !teamSize) {
      return res.status(400).json({ message: 'Room and Team Size are required' });
    }

    // validate team size
    if (teamSize < 1) {
       return res.status(400).json({ message: 'Team Size must be at least 1' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (teamSize > room.capacity) {
      return res.status(400).json({ message: `Team size exceeds room capacity of ${room.capacity}` });
    }

    // Check for time slot conflicts and capacity
    // Find all APPROVED bookings for this room, date, and overlapping time
    // Pending bookings do NOT block new requests
    const existingBookings = await Booking.find({
      slotDate,
      room: roomId,
      status: 'approved',
    });

    // Check for "Overlap" in time is not enough. We need to check capacity for the specific time range.
    // However, since time slots might be flexible or fixed, simpler approach:
    // Find all bookings that overlap with the requested time.
    // Sum their team sizes.
    
    // Filter to only those that overlap
    const overlappingBookings = existingBookings.filter(b => timesOverlap(startTime, endTime, b.startTime, b.endTime));
    
    // Calculate total occupied seats
    const occupiedSeats = overlappingBookings.reduce((sum, b) => sum + b.teamSize, 0);

    console.log('--- Capacity Check ---');
    console.log('Room Capacity:', room.capacity);
    console.log('Requested Team Size:', parseInt(teamSize));
    console.log('Existing Bookings (Count):', existingBookings.length);
    console.log('Overlapping Bookings (Count):', overlappingBookings.length);
    console.log('Occupied Seats:', occupiedSeats);
    console.log('New Total:', occupiedSeats + parseInt(teamSize));
    console.log('----------------------');

    if (occupiedSeats + parseInt(teamSize) > room.capacity) {
      const remaining = room.capacity - occupiedSeats;
      return res.status(409).json({ 
        message: `Slot Full / Capacity Issue. Your team contains ${teamSize} members, but only ${remaining} seats are available in this room for the selected time slot. Please choose a different room or time slot.` 
      });
    }

    // Create the booking with all provided fields
    const booking = await Booking.create({ 
      team: teamId,
      room: roomId,
      teamSize,
      slotDate, 
      startTime, 
      endTime, 
      purpose,
      description: description || '',
      teamName: teamName || '',
      status: 'pending', // Ensure new bookings are set to pending
      history: [
        {
          status: 'pending',
          reason: '',
          by: teamId,
          at: new Date(),
        },
      ],
    });
    
    console.log('Booking created successfully:', booking);
    return res.status(201).json({ 
      message: 'Booking request submitted successfully',
      booking 
    });
  } catch (err) {
    console.error(err);
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
      // 1. Fetch Room Capacity
      const room = await Room.findById(booking.room);
      if (!room) return res.status(404).json({ message: 'Room associated with booking not found' });

      // 2. Find all currently APPROVED bookings that overlap with this one
      const conflicts = await Booking.find({ 
        slotDate: booking.slotDate, 
        room: booking.room,
        status: 'approved', 
        _id: { $ne: booking._id } 
      });

      // Filter strict overlaps
      const overlappingBookings = conflicts.filter(b => timesOverlap(booking.startTime, booking.endTime, b.startTime, b.endTime));
      
      // 3. Calculate Occupied Seats
      const occupiedSeats = overlappingBookings.reduce((sum, b) => sum + b.teamSize, 0);
      const neededSeats = booking.teamSize;

      if (occupiedSeats + neededSeats > room.capacity) {
         const remaining = room.capacity - occupiedSeats;
         return res.status(409).json({ 
           message: `Cannot approve. Room capacity exceeded. Only ${remaining} seats available, but this team needs ${neededSeats}.` 
         });
      }

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
      booking.history.push({ status: 'approved', reason: booking.reason, by: req.user._id, at: new Date() });
      await booking.save();
    } else if (decision === 'rejected') {
      booking.status = 'rejected';
      booking.reason = reason || '';
      booking.history.push({ status: 'rejected', reason: booking.reason, by: req.user._id, at: new Date() });
      await booking.save();
    } else {
      return res.status(400).json({ message: 'Invalid decision' });
    }

    return res.status(200).json({ booking });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to decide booking', error: err.message });
  }
}

export async function getAllBookings(req, res) {
  try {
    // This is a coordinator-only action, so no need to filter by user
    const bookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .populate('team', 'name teamName');

    return res.status(200).json(bookings);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch all bookings', error: err.message });
  }
}

export async function getMyBookings(req, res) {
  try {
    const bookings = await Booking.find({ team: req.user._id })
      .sort({ createdAt: -1 })
      .populate('team', 'name teamName'); // Populate user details if needed

    return res.status(200).json(bookings);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch your bookings', error: err.message });
  }
}

export async function getMyBookingHistory(req, res) {
  try {
    const bookings = await Booking.find({ team: req.user._id })
      .select('slotDate startTime endTime purpose status reason history createdAt updatedAt')
      .sort({ createdAt: -1 });
    return res.status(200).json({ bookings });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch booking history', error: err.message });
  }
}

export async function getAllBookingHistory(req, res) {
  try {
    const bookings = await Booking.find({})
      .select('slotDate startTime endTime purpose status reason history team createdAt updatedAt')
      .populate('team', 'name email teamName')
      .sort({ createdAt: -1 });
    return res.status(200).json({ bookings });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch all booking history', error: err.message });
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
  getRoomAvailability, 
  createBooking, 
  getPendingBookings, 
  decideBooking,
  getDashboardStats,
  getMyBookings,
  getAllBookings,
  getMyBookingHistory,
  getAllBookingHistory
};

