const express = require("express");
const router = express.Router();
const { authRequired } = require("../middleware/auth");
const {
  getUserWeekendPlans,
  getWeekendPlan,
  getCurrentWeekendPlan,
  getWeekendPlanByDate,
  createOrUpdateWeekendPlan,
  updatePlanStatus,
  completeWeekendPlan,
  getUserHistory,
  exportWeekendPlan,
} = require("../controllers/simpleWeekendPlanController");

// Get all weekend plans for user (with pagination)
router.get("/", authRequired, getUserWeekendPlans);

// Get current weekend plan (this weekend)
router.get("/current", authRequired, getCurrentWeekendPlan);

// Get weekend plan by specific date
router.get("/date/:date", authRequired, getWeekendPlanByDate);

// Get user's activity history and statistics
router.get("/history", authRequired, getUserHistory);

// Get specific weekend plan
router.get("/:id", authRequired, getWeekendPlan);

// Create or update weekend plan
router.post("/", authRequired, createOrUpdateWeekendPlan);

// Update plan status
router.put("/:id/status", authRequired, updatePlanStatus);

// Complete weekend plan with reviews
router.post("/:id/complete", authRequired, completeWeekendPlan);

// Export weekend plan as SVG
router.get("/:id/export", authRequired, exportWeekendPlan);

module.exports = router;
