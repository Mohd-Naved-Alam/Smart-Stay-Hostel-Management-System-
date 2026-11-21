const express = require('express');
const router = express.Router();

router.post('/login', async (req, res) => {
  // Simple login for now
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    res.json({ 
      success: true, 
      user: { name: 'Admin User', role: 'admin' },
      token: 'sample_token_12345'
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

module.exports = router;