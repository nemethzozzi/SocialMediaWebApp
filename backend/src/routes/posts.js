const express = require("express");
const multer = require("multer");
const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const path = require("path");

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append the current timestamp to the file name
  },
});

const upload = multer({ storage });

// Middleware to serve static files
router.use(
  "/uploads",
  express.static(path.join(__dirname, "../public/uploads"))
);

// Create a post
router.post("/", upload.single("image"), async (req, res) => {
  const newPost = new Post({
    ...req.body,
    img: req.file ? `/uploads/${req.file.filename}` : null,
  });
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

//update a post

router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("the post has been updated");
    } else {
      res.status(403).json("you can update only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//delete a post

router.delete("/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== req.body.userId) {
      return res
        .status(401)
        .json({ message: "You can delete only your posts" });
    }

    await Post.findByIdAndDelete(postId); // Using findByIdAndDelete instead of remove
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", postId, error);
    res
      .status(500)
      .json({ message: "Error deleting post", error: error.message });
  }
});

//like / dislike a post

router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//get a post

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get timeline posts

router.get("/timeline/all", async (req, res) => {
  try {
    const currentUser = await User.findById(req.query.userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => Post.find({ userId: friendId }))
    );
    res.json([...userPosts, ...friendPosts.flat()]);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Add a comment to a post
router.post("/:postId/comments", async (req, res) => {
  const { postId } = req.params;
  const { userId, text } = req.body; // Assume these are passed in the request

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({ userId, text });
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add comment" });
  }
});

// Get comments for a post might not be necessary if you're fetching them
// together with the post but here's how you could do it
router.get("/:postId/comments", async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId).populate(
      "comments.userId",
      "username"
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post.comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get comments" });
  }
});

// Delete a comment from a post
router.delete("/:postId/comments/:commentId", async (req, res) => {
  const { postId, commentId } = req.params;
  const { userId } = req.body; // The ID of the user requesting the deletion

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Find the comment index
    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );

    // If the comment doesn't exist
    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the requesting user is the comment owner
    if (post.comments[commentIndex].userId.toString() !== userId) {
      return res
        .status(401)
        .json({ message: "You can delete only your comments" });
    }

    // Remove the comment
    post.comments.splice(commentIndex, 1);

    // Save the post
    await post.save();
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting comment" });
  }
});

module.exports = router;
