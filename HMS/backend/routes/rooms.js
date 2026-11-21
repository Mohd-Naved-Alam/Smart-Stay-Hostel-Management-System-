const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const room = new Room(req.body);
  try {
    const newRoom = await room.save();
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// NEW: Update room endpoint (PUT /api/rooms/:id)
router.put('/:id', async (req, res) => {
  try {
    // Find the room by ID and update it. 'new: true' returns the updated document.
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, 
      runValidators: true // Ensure Mongoose runs validation checks on updates
    });
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json(room);
  } catch (error) {
    // Handle validation and general errors
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
