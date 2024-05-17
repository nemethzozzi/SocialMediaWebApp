const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

//REGISTER
router.post("/register", async (req, res) => {
  try {
    // Check if the username is already in use
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(400).json({ message: "Username is already in use" });
    }

    // Generate new password hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    // Save user and respond
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(400).json({ message: "Password is not correct" });
    }

    // Respond with user data if login is successful
    res.status(200).json(user); // Be careful with what you send back!
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
});

module.exports = router;
