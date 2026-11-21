const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNo: { type: String, required: true, unique: true },
  block: String,
  floor: Number,
  roomType: {
    name: String,
    capacity: Number
  },
  occupied: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Room', roomSchema);