const User = require("../models/User");
const Post = require("../models/Post");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");

// Setup multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/");
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, `profilePicture-${Date.now()}.${ext}`);
  },
});

const upload = multer({ storage: storage });

// Upload profile picture
router.post(
  "/upload/:userId",
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send("User not found");
      }
      user.profilePicture = `/images/${req.file.filename}`; // Update profile picture path
      await user.save();
      res.send({ message: "Profile updated successfully", data: user });
    } catch (error) {
      res.status(500).send("Server error");
    }
  }
);

// Update user
router.put("/:id", upload.single("profilePicture"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    if (req.file) {
      user.profilePicture = `/images/${req.file.filename}`; // Ensure the path is web accessible
    }
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }
    await user.save();

    res.status(200).json({
      message: "Profile updated",
      profilePicture: user.profilePicture,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update", error: err.message });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only your account!");
  }
});

// Follow a user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId === req.params.id) {
    return res.status(403).json("You cannot follow yourself");
  }

  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.body.userId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json("User not found");
    }

    if (userToFollow.followers.includes(req.body.userId)) {
      return res.status(403).json("You already follow this user");
    }

    await userToFollow.updateOne({ $push: { followers: req.body.userId } });
    await currentUser.updateOne({ $push: { followings: req.params.id } });
    res.status(200).json("User has been followed");
  } catch (err) {
    res.status(500).json(err);
  }
});

// Unfollow a user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId === req.params.id) {
    return res.status(403).json("You cannot unfollow yourself");
  }

  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.body.userId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json("User not found");
    }

    if (!userToUnfollow.followers.includes(req.body.userId)) {
      return res.status(403).json("You do not follow this user");
    }

    await userToUnfollow.updateOne({ $pull: { followers: req.body.userId } });
    await currentUser.updateOne({ $pull: { followings: req.params.id } });
    res.status(200).json("User has been unfollowed");
  } catch (err) {
    res.status(500).json(err);
  }
});

// Fetch posts for a specific user
router.get("/:id/posts", async (req, res) => {
  try {
    const userPosts = await Post.find({ userId: req.params.id });
    res.json(userPosts);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});

// Get all users
router.get("/", async (req, res) => {
  try {
    const currentUserId = req.query.currentUserId; // Assume this is passed as a query parameter
    const users = await User.find().select("-password");
    const usersWithFollowingInfo = users.map((user) => ({
      ...user._doc,
      isFollowing: user.followers.includes(currentUserId),
    }));
    res.json(usersWithFollowingInfo);
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Check if username is available
router.get("/check-username", async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res
      .status(400)
      .json({ message: "Username query parameter is required" });
  }

  try {
    const user = await User.findOne({ username });
    res.status(200).json({ available: !user });
  } catch (error) {
    console.error("Error in check-username route: ", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Get a user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password, ...userData } = user._doc;
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching user by ID: ", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Fetch the list of followings for a user
router.get("/:id/followings", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "followings",
      "username profilePicture"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.followings);
  } catch (error) {
    console.error("Failed to fetch followings:", error);
    res.status(500).json({ message: "Failed to fetch followings" });
  }
});

module.exports = router;
