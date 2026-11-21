const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relation: String,
  phone: String,
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  checkIn: { type: Date, default: Date.now },
  checkOut: Date
});

module.exports = mongoose.model('Visitor', visitorSchema);