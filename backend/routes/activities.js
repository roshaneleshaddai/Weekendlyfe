const express = require("express");
const {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} = require("../controllers/activityController");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/", getActivities);

// Protected routes
router.post("/", authRequired, createActivity);
router.put("/:id", authRequired, updateActivity);
router.delete("/:id", authRequired, deleteActivity);

module.exports = router;
