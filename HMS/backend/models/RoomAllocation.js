const mongoose = require('mongoose');

const roomAllocationSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student',
    required: true,
    unique: true
  },
  roomId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Room',
    required: true
  },
  allocatedFrom: { 
    type: Date, 
    default: Date.now 
  },
  allocatedTo: Date,
  active: { 
    type: Boolean, 
    default: true 
  }
});

module.exports = mongoose.model('RoomAllocation', roomAllocationSchema);