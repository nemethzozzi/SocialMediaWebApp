const express = require("express");
const multer = require("multer");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Middleware to serve static files
router.use("/uploads", express.static(uploadDir));

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

// Update a post
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      const updatedData = { desc: req.body.desc, edited: true };
      if (req.file) {
        updatedData.img = `/uploads/${req.file.filename}`;
      }
      await post.updateOne({ $set: updatedData });
      res.status(200).json("The post has been updated");
    } else {
      res.status(403).json("You can update only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a post
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

    await Post.findByIdAndDelete(postId);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", postId, error);
    res
      .status(500)
      .json({ message: "Error deleting post", error: error.message });
  }
});

// Like / dislike a post
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

// Get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get timeline posts
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
  const { userId, text } = req.body;

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

// Get comments for a post
router.get("/:postId/comments", async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId).populate(
      "comments.userId",
      "username profilePicture"
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

// Edit a comment on a post
router.put("/:postId/comments/:commentId", async (req, res) => {
  const { postId, commentId } = req.params;
  const { text, userId } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const comment = post.comments[commentIndex];

    if (comment.userId.toString() !== userId) {
      return res
        .status(401)
        .json({ message: "You can edit only your comments" });
    }

    comment.text = text;
    comment.edited = true;

    await post.save();
    res.json({ message: "Comment updated successfully", comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating comment" });
  }
});

// Delete a comment from a post
router.delete("/:postId/comments/:commentId", async (req, res) => {
  const { postId, commentId } = req.params;
  const { userId } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (post.comments[commentIndex].userId.toString() !== userId) {
      return res
        .status(401)
        .json({ message: "You can delete only your comments" });
    }

    post.comments.splice(commentIndex, 1);

    await post.save();
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting comment" });
  }
});

// Add a like / dislike route for comments
router.put("/:postId/comments/:commentId/like", async (req, res) => {
  const { postId, commentId } = req.params;
  const { userId } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const comment = post.comments[commentIndex];

    if (!comment.likes) {
      comment.likes = [];
    }

    if (!comment.likes.includes(userId)) {
      comment.likes.push(userId);
      res.status(200).json("The comment has been liked");
    } else {
      comment.likes = comment.likes.filter((id) => id !== userId);
      res.status(200).json("The comment has been disliked");
    }

    await post.save();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to like/dislike comment" });
  }
});

module.exports = router;
