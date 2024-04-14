const express = require("express");
const Notification = require("../models/Notification");

const router = express.Router();

// Fetch notifications for a user
router.get("/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.params.userId,
    }).sort({ date: -1 });
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching notifications");
  }
});

module.exports = router;
