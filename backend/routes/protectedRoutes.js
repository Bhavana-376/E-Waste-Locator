const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const User = require('../models/User');

// GET /api/user/dashboard — Fetch user details
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user }); // 🔄 simplified to match updated frontend
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/user/profile — Update phone & address
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone, address },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json({
      message: 'Profile updated successfully!',
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        credits: updatedUser.credits || 0
      }
    });
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});
// POST /api/user/credits — Submit recovered item info and update points
router.post('/credits', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      items,
      quantity,
      recoveryType,
      centerName,
      recoveredDate,
      notes
    } = req.body;

    // 🧮 Calculate points
    const basePoints = 10; // per item x quantity
    const pointsEarned = items.length * quantity * basePoints;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Save the new credit entry
    user.creditHistory.push({
      items,
      quantity,
      recoveryType,
      centerName,
      recoveredDate,
      notes,
      pointsEarned
    });

    // Update total credits
    user.credits += pointsEarned;
    await user.save();

    res.json({
      message: `You earned ${pointsEarned} credit points!`,
      updatedCredits: user.credits
    });
  } catch (err) {
    console.error('Credit submission error:', err.message);
    res.status(500).json({ message: 'Server error processing credits' });
  }
});


module.exports = router;
