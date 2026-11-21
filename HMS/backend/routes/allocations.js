const express = require('express');
const router = express.Router();
const RoomAllocation = require('../models/RoomAllocation');
const Room = require('../models/Room');
const Student = require('../models/Student');

// Get all allocations
router.get('/', async (req, res) => {
  try {
    const allocations = await RoomAllocation.find()
      .populate('studentId')
      .populate('roomId');
    res.json(allocations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Allocate room to student
router.post('/', async (req, res) => {
  try {
    const { studentId, roomId } = req.body;
    
    // Check if student already has a room
    const existingAllocation = await RoomAllocation.findOne({ studentId, active: true });
    if (existingAllocation) {
      return res.status(400).json({ message: 'Student already has a room allocated' });
    }
    
    // Check if room has space
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    if (room.occupied >= room.roomType.capacity) {
      return res.status(400).json({ message: 'Room is full' });
    }
    
    // Create allocation
    const allocation = new RoomAllocation({
      studentId,
      roomId,
      active: true
    });
    
    await allocation.save();
    
    // Increase room's occupied count
    await Room.findByIdAndUpdate(roomId, { $inc: { occupied: 1 } });
    
    res.status(201).json(allocation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Deallocate room (checkout student)
router.delete('/:id', async (req, res) => {
  try {
    const allocation = await RoomAllocation.findById(req.params.id);
    
    if (!allocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }
    
    // Decrease room's occupied count
    await Room.findByIdAndUpdate(
      allocation.roomId,
      { $inc: { occupied: -1 } }
    );
    
    // Delete allocation
    await RoomAllocation.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Room deallocated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;