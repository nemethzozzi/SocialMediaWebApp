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
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("user has been followed");
      } else {
        res.status(403).json("you allready follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant follow yourself");
  }
});

//unfollow a user

router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("user has been unfollowed");
      } else {
        res.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant unfollow yourself");
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

// Get random users
router.get("/random", async (req, res) => {
  try {
    // Assuming you want to exclude the current user from the random list, pass their id in the query.
    const currentUserId = req.query.currentUserId;

    // Adjust the number in $sample to the number of random documents you want.
    const randomUsers = await User.aggregate([
      { $match: { _id: { $ne: mongoose.Types.ObjectId(currentUserId) } } },
      { $sample: { size: 5 } },
      { $project: { password: 0, email: 0, updatedAt: 0 } }, // Exclude sensitive information
    ]);

    res.json(randomUsers);
  } catch (error) {
    console.error("Failed to fetch random users:", error);
    res.status(500).json({ message: "Failed to fetch random users." });
  }
});

// Sample backend code for searching users
router.get("/search", async (req, res) => {
  try {
    const { username } = req.query;
    // Assuming you have some logic here to search users by username...
    const users = await User.find({ username: new RegExp(username, "i") });
    res.json(users);
  } catch (error) {
    console.error("Search error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error while searching users" });
  }
});

module.exports = router;
