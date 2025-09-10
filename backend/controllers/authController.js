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

module.exports = {
  signup,
  login,
};
