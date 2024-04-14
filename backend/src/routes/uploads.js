const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// Storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure this uploads directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append the date to the original filename to avoid name collisions
  },
});

const upload = multer({ storage: storage });

// Route to handle file upload
router.post("/", upload.single("image"), (req, res) => {
  if (req.file) {
    res.json({
      success: true,
      filename: req.file.filename, // Send the file name to the client
    });
  } else {
    res.status(400).json({ success: false, message: "No file uploaded." });
  }
});

module.exports = router;
