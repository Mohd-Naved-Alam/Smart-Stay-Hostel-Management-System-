const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  rollNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dob: Date,
  gender: { type: String, enum: ['M', 'F', 'Other'] },
  contactPhone: String,
  email: { type: String, unique: true },
  course: String,
  year: Number,
  // NEW FIELD: Used for linking the student to a room and updating occupancy
  roomNo: String, 
  emergencyContactName: String,
  emergencyContactPhone: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
