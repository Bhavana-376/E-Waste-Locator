// routes/creditRoute.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Credit logic based on item type
function calculatePoints(items = [], quantity = 1) {
  const pointsMap = {
    "Mobile": 10,
    "Laptop": 20,
    "TV": 25,
    "Printer": 15,
    "Others": 5,
  };

  let total = 0;
  items.forEach(item => {
    total += (pointsMap[item] || 5);
  });

  return total * quantity;
}

router.post("/submit-ewaste", async (req, res) => {
  try {
    const { userId, items, quantity, recoveryType, centerName, notes } = req.body;

    const totalPoints = calculatePoints(items, quantity); // ✅ this now works properly

    const creditEntry = {
      items, 
      quantity: quantity || 1,
      recoveryType,
      centerName,
      recoveredDate: new Date(),
      notes,
      pointsEarned: totalPoints,
    };

    await User.findByIdAndUpdate(userId, {
      $inc: { credits: totalPoints },
      $push: { creditHistory: creditEntry },
    });

    res.status(200).json({
      success: true,
      message: "Credits added successfully",
      pointsAdded: totalPoints,
    });
  } catch (error) {
    console.error("Error updating credits:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

module.exports = router;
