const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const notificationRoute = require("./routes/notifications");
const searchRoute = require("./routes/users");
const path = require("path");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5000",
    "http://socialmediawebapp.s3-website.eu-north-1.amazonaws.com",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

function setCrossOriginResourcePolicy(req, res, next) {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}

//middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

// API routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/search", searchRoute);

// Serve static files
app.use(
  "/uploads",
  setCrossOriginResourcePolicy,
  express.static(path.join(__dirname, "..", "public", "uploads"))
);
app.use(
  "/images",
  setCrossOriginResourcePolicy,
  express.static(path.join(__dirname, "..", "public", "images"))
);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Backend server is running on port ${process.env.PORT || 5000}!`);
});
