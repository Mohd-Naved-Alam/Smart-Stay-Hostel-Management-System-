const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Room = require('../models/Room');
const RoomAllocation = require('../models/RoomAllocation');

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single student
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create student
router.post('/', async (req, res) => {
  const student = new Student(req.body);
  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete student (WITH ROOM CLEANUP)
router.delete('/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Find the student's room allocation
    const allocation = await RoomAllocation.findOne({ studentId, active: true });
    
    if (allocation) {
      // Decrease the room's occupied count
      await Room.findByIdAndUpdate(
        allocation.roomId,
        { $inc: { occupied: -1 } }
      );
      
      // Delete or deactivate the allocation
      await RoomAllocation.findByIdAndDelete(allocation._id);
    }
    
    // Delete the student
    await Student.findByIdAndDelete(studentId);
    
    res.json({ 
      message: 'Student deleted successfully',
      roomUpdated: allocation ? true : false
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;