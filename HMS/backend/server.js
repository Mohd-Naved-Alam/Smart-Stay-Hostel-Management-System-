require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Import Routes
const studentRoutes = require('./routes/students');
const roomRoutes = require('./routes/rooms');
const messRoutes = require('./routes/mess');
const requestRoutes = require('./routes/requests');
const visitorRoutes = require('./routes/visitors');
const authRoutes = require('./routes/auth');
const allocationRoutes = require('./routes/allocations');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/allocations', allocationRoutes);

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Hostel Management System API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});