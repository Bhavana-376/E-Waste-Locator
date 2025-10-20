// backend/routes/center.js

const express = require('express');
const router = express.Router();
const Center = require('../models/Center');

// GET /api/centers - fetch all centers
router.get('/', async (req, res) => {
  try {
    const centers = await Center.find();
    res.json(centers);
  } catch (err) {
    console.error('Error fetching centers:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
