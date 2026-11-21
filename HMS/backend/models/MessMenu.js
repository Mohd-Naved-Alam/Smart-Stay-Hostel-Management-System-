const mongoose = require('mongoose');

const messMenuSchema = new mongoose.Schema({
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  breakfast: String,
  lunch: String,
  snacks: String,
  dinner: String
});

module.exports = mongoose.model('MessMenu', messMenuSchema);