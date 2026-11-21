const express = require('express');
const router = express.Router();
const MessMenu = require('../models/MessMenu');

router.get('/', async (req, res) => {
  try {
    const menu = await MessMenu.find();
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const menu = new MessMenu(req.body);
  try {
    const newMenu = await menu.save();
    res.status(201).json(newMenu);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;