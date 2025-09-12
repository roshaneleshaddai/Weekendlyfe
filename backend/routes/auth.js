const express = require("express");
const {
  signup,
  login,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/authController");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

// GET /api/auth/profile
router.get("/profile", authRequired, getUserProfile);

// PUT /api/auth/profile
router.put("/profile", authRequired, updateUserProfile);

module.exports = router;
