const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const cookieParser = require("cookie-parser");

// Import routes
const authRoutes = require("./routes/auth");
const activityRoutes = require("./routes/activities");
const planRoutes = require("./routes/plans");
const themeRoutes = require("./routes/themes");
const weekendPlanRoutes = require("./routes/weekendPlans");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Database connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/weekendly";
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/themes", themeRoutes);
app.use("/api/weekend-plans", weekendPlanRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Weekendly API is running" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("Server running on", PORT));
