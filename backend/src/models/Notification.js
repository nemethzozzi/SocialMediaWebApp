const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: String, // e.g., 'like' or 'comment'
  byUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  date: { type: Date, default: Date.now },
  seen: { type: Boolean, default: false },
});

module.exports = mongoose.model("Notification", notificationSchema);
