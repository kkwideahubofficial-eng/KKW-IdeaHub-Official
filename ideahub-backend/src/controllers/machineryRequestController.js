import MachineryRequest from '../models/MachineryRequest.js';
import '../models/Machinery.js'; // Ensure Machinery model is registered for populate

// Create a new request (Student)
export const createRequest = async (req, res) => {
  try {
    const { 
      machineryId, 
      teamMembers, 
      usageDate, 
      startTime, 
      endTime, 
      purpose, 
      consentAgreed, 
      groupPhotoUrl 
    } = req.body;

    // TODO: Add validation to check if slot is already booked? 
    // For now, allowing multiple requests for same slot, head will decide.

    const newRequest = new MachineryRequest({
      machineryId,
      studentId: req.user._id,
      teamMembers,
      usageDate,
      startTime,
      endTime,
      purpose,
      consentAgreed,
      groupPhotoUrl,
      status: 'pending'
    });

    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ message: 'Error creating request', error: error.message });
  }
};

// Get all requests (Head) or My requests (Student)
export const getRequests = async (req, res) => {
  try {
    console.log('getRequests: Starting...');
    console.log('getRequests: req.user:', req.user);

    if (!req.user) {
      throw new Error('req.user is undefined in getRequests');
    }

    const { role, _id } = req.user;
    let query = {};

    if (role === 'head' || role === 'admin') {
      // Head sees all requests
      query = {};
    } else {
      // Students see only their own requests
      query = { studentId: _id };
    }

    console.log('getRequests: Query:', query);
    console.log('getRequests: MachineryRequest Model:', MachineryRequest);
    
    // Test basic find first
    // const count = await MachineryRequest.countDocuments(query);
    // console.log('getRequests: Count:', count);

    const requests = await MachineryRequest.find(query)
      .populate('machineryId', 'name imageUrl')
      .populate('studentId', 'name email mobile branch year') // Populate requester details
      .sort({ createdAt: -1 });

    console.log('getRequests: Found:', requests.length);

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching requests IN CONTROLLER:', error);
    // Send back the specific error message to the client
    res.status(500).json({ 
        message: 'Error fetching requests', 
        error: error.message,
        stack: error.stack 
    });
  }
};

// Update request status (Head - Approve/Reject)
export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
    }

    const updateData = {
        status,
        approvedBy: req.user._id
    };

    if (status === 'rejected') {
        updateData.rejectionReason = rejectionReason || 'No reason provided';
    }

    const updatedRequest = await MachineryRequest.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error regarding request', error: error.message });
  }
};
