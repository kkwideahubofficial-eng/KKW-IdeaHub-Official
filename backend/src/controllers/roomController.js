import { Room } from '../models/Room.js';

export async function getRooms(req, res) {
  try {
    let query = {};
    const userRole = req.user?.role;

    // If NOT head or admin, only show active rooms
    if (userRole !== 'head' && userRole !== 'admin') {
      query.isActive = true;
    }

    const rooms = await Room.find(query).sort({ name: 1 });
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch rooms', error: err.message });
  }
}

export async function createRoom(req, res) {
  try {
    const { name, capacity, features, timeSlots } = req.body;
    const room = new Room({ name, capacity, features, timeSlots });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    console.error('Error creating room:', err);
    res.status(500).json({ message: 'Failed to create room', error: err.message });
  }
}

export async function updateRoom(req, res) {
  try {
    const { id } = req.params;
    const { name, capacity, features, isActive, timeSlots } = req.body;
    console.log(`Updating Room ${id}. Payload:`, { name, capacity, features, isActive, timeSlots });

    // Explicitly set lastUpdatedDate
    const updateData = { 
        name, capacity, features, isActive, timeSlots,
        lastUpdatedDate: new Date()
    };

    const room = await Room.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    console.log('Updated Room Result:', room);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.status(200).json(room);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update room', error: err.message });
  }
}

export async function deleteRoom(req, res) {
  try {
    const { id } = req.params;
    // Hard delete
    const room = await Room.findByIdAndDelete(id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete room', error: err.message });
  }
}
