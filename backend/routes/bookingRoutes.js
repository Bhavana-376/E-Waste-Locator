const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Center = require('../models/Center');
const User = require('../models/User');
const authMiddleware = require('../middleware/verifyToken');

// @route POST /api/bookings
// @desc Book a center (only if it has a booking link)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { centerId } = req.body;

    const center = await Center.findById(centerId);
    if (!center || !center.bookingLink) {
      return res.status(400).json({ message: "Booking not available for this center." });
    }

    const booking = new Booking({
    userId: userId,
    centerId: centerId
    });


    await booking.save();

    res.status(201).json({ message: "Booking recorded successfully!" });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ message: "Server error during booking." });
  }
});

module.exports = router;
