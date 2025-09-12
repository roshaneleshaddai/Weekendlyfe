const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      location,
      preferred_activities,
      budget_range,
      companions,
      preferred_vibe,
      dietary_preferences,
    } = req.body;

    if (!email || !password || !name)
      return res
        .status(400)
        .json({ error: "Name, email and password are required" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      passwordHash,
      phone: phone || "",
      location: location || "",
      preferred_activities: preferred_activities || [],
      budget_range: budget_range || "medium",
      companions: companions || [],
      preferred_vibe: preferred_vibe || [],
      dietary_preferences: dietary_preferences || [],
      lastLogin: new Date(),
    };

    const u = new User(userData);
    await u.save();

    const token = jwt.sign({ id: u._id }, JWT_SECRET, { expiresIn: "30d" });

    // Return user data without sensitive information
    const userResponse = {
      id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      location: u.location,
      preferred_activities: u.preferred_activities,
      budget_range: u.budget_range,
      companions: u.companions,
      preferred_vibe: u.preferred_vibe,
      dietary_preferences: u.dietary_preferences,
    };

    res.json({ token, user: userResponse });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const u = await User.findOne({ email });
    if (!u) return res.status(400).json({ error: "Invalid email or password" });

    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok)
      return res.status(400).json({ error: "Invalid email or password" });

    // Update last login
    u.lastLogin = new Date();
    await u.save();

    const token = jwt.sign({ id: u._id }, JWT_SECRET, { expiresIn: "30d" });

    // Return enhanced user data
    const userResponse = {
      id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      location: u.location,
      preferred_activities: u.preferred_activities,
      budget_range: u.budget_range,
      companions: u.companions,
      preferred_vibe: u.preferred_vibe,
      dietary_preferences: u.dietary_preferences,
    };

    res.json({ token, user: userResponse });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      location,
      preferred_activities,
      budget_range,
      companions,
      preferred_vibe,
      dietary_preferences,
      bio,
      notifications,
    } = req.body;

    const updateData = {};

    // Only update fields that are provided
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    if (preferred_activities !== undefined)
      updateData.preferred_activities = preferred_activities;
    if (budget_range !== undefined) updateData.budget_range = budget_range;
    if (companions !== undefined) updateData.companions = companions;
    if (preferred_vibe !== undefined)
      updateData.preferred_vibe = preferred_vibe;
    if (dietary_preferences !== undefined)
      updateData.dietary_preferences = dietary_preferences;
    if (bio !== undefined) updateData.bio = bio;
    if (notifications !== undefined) updateData.notifications = notifications;

    const user = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Update user profile error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  signup,
  login,
  getUserProfile,
  updateUserProfile,
};
