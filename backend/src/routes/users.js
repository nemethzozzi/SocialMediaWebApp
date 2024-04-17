const User = require("../models/User");
const Post = require("../models/Post");
const router = require("express").Router();
const bcrypt = require("bcrypt");

//update user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been updated");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only your account!");
  }
});

//delete user
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

//get a user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow a user

router.put("/:id/follow", async (req, res) => {
  console.log(
    `Following request for user ${req.params.id} by ${req.body.userId}`
  );
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

// unfollow a user

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

router.get("/api/users/:id/posts", async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.id });
    res.json(posts);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Fetch posts for a specific user
router.get("/:id/posts", async (req, res) => {
  try {
    const userPosts = await Post.find({ userId: req.params.id });
    res.json(userPosts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user's posts." });
  }
});

// Get all users
router.get("/", async (req, res) => {
  try {
    const currentUserId = req.query.currentUserId; // Assume this is passed as a query parameter
    const users = await User.find().select("-password");
    const usersWithFollowingInfo = users.map((user) => {
      return {
        ...user._doc,
        isFollowing: user.followers.includes(currentUserId),
      };
    });
    res.json(usersWithFollowingInfo);
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Search user by username
router.get("/search/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "_id username"
    );
    if (user) {
      // Return the user's ID in the response
      res.status(200).json({ id: user._id.toString() }); // Convert ObjectId to string
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error searching for user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
