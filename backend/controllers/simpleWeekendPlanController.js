// Simple Weekend Plan Controller for basic functionality
const User = require("../models/User");
const Activity = require("../models/Activity");

// In-memory storage for weekend plans (for demo purposes)
let weekendPlans = {};
let planIdCounter = 1;

// Get current weekend plan (simplified)
const getCurrentWeekendPlan = async (req, res) => {
  try {
    // Find or create current plan for user
    const userPlans = weekendPlans[req.userId] || [];
    let currentPlan = userPlans.find((plan) => plan.status !== "completed");

    if (!currentPlan) {
      // Create a new plan
      currentPlan = {
        _id: `plan_${planIdCounter++}`,
        user: req.userId,
        weekend_date: new Date(),
        status: "planning",
        saturday_activities: [],
        sunday_activities: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!weekendPlans[req.userId]) {
        weekendPlans[req.userId] = [];
      }
      weekendPlans[req.userId].push(currentPlan);
    }

    res.json(currentPlan);
  } catch (error) {
    console.error("Get current weekend plan error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get user history (simplified)
const getUserHistory = async (req, res) => {
  try {
    const userPlans = weekendPlans[req.userId] || [];
    const completedPlans = userPlans.filter(
      (plan) => plan.status === "completed"
    );

    const history = {
      stats: {
        total_plans: userPlans.length,
        completed_plans: completedPlans.length,
        average_rating: 0, // TODO: Calculate from ratings
      },
      plans: userPlans.slice().reverse(), // Most recent first
    };

    res.json(history);
  } catch (error) {
    console.error("Get user history error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create or update weekend plan (simplified)
const createOrUpdateWeekendPlan = async (req, res) => {
  try {
    if (!weekendPlans[req.userId]) {
      weekendPlans[req.userId] = [];
    }

    const userPlans = weekendPlans[req.userId];
    let currentPlan = userPlans.find((plan) => plan.status !== "completed");

    if (currentPlan) {
      // Update existing plan
      currentPlan.saturday_activities = req.body.saturday_activities || [];
      currentPlan.sunday_activities = req.body.sunday_activities || [];
      currentPlan.weekend_date =
        req.body.weekend_date || currentPlan.weekend_date;
      currentPlan.status = req.body.status || currentPlan.status;
      currentPlan.tags = req.body.tags || currentPlan.tags || [];
      currentPlan.updatedAt = new Date();
    } else {
      // Create new plan
      currentPlan = {
        _id: `plan_${planIdCounter++}`,
        user: req.userId,
        weekend_date: req.body.weekend_date || new Date(),
        status: req.body.status || "planning",
        saturday_activities: req.body.saturday_activities || [],
        sunday_activities: req.body.sunday_activities || [],
        tags: req.body.tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      userPlans.push(currentPlan);
    }

    res.json(currentPlan);
  } catch (error) {
    console.error("Create/update weekend plan error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Export weekend plan (simplified)
const exportWeekendPlan = async (req, res) => {
  try {
    // Simple SVG export
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
      <rect width="100%" height="100%" fill="#f1f5f9"/>
      <text x="40" y="60" font-size="28" font-family="sans-serif" fill="#111">Weekend Plan</text>
      <text x="40" y="100" font-size="16" font-family="sans-serif" fill="#666">Plan ID: ${req.params.id}</text>
    </svg>`;

    res.setHeader("Content-Type", "image/svg+xml");
    res.send(svg);
  } catch (error) {
    console.error("Export weekend plan error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all weekend plans (simplified)
const getUserWeekendPlans = async (req, res) => {
  try {
    const plans = [];
    const pagination = {
      current_page: 1,
      total_pages: 0,
      total_plans: 0,
      has_next: false,
      has_prev: false,
    };

    res.json({ plans, pagination });
  } catch (error) {
    console.error("Get weekend plans error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get specific weekend plan (simplified)
const getWeekendPlan = async (req, res) => {
  try {
    const plan = {
      _id: req.params.id,
      user: req.userId,
      weekend_date: new Date(),
      status: "planning",
      saturday_activities: [],
      sunday_activities: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    res.json(plan);
  } catch (error) {
    console.error("Get weekend plan error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update plan status
const updatePlanStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userPlans = weekendPlans[req.userId] || [];
    const plan = userPlans.find((p) => p._id === req.params.id);

    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    plan.status = status;
    plan.updatedAt = new Date();

    if (status === "completed") {
      plan.completedAt = new Date();
    }

    res.json(plan);
  } catch (error) {
    console.error("Update plan status error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Complete weekend plan (simplified)
const completeWeekendPlan = async (req, res) => {
  try {
    const userPlans = weekendPlans[req.userId] || [];
    const plan = userPlans.find((p) => p._id === req.params.id);

    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    plan.status = "completed";
    plan.completedAt = new Date();
    plan.updatedAt = new Date();

    // Add completion data if provided
    if (req.body.overall_rating) {
      plan.overall_rating = req.body.overall_rating;
    }
    if (req.body.overall_review) {
      plan.overall_review = req.body.overall_review;
    }

    res.json(plan);
  } catch (error) {
    console.error("Complete weekend plan error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUserWeekendPlans,
  getWeekendPlan,
  getCurrentWeekendPlan,
  createOrUpdateWeekendPlan,
  updatePlanStatus,
  completeWeekendPlan,
  getUserHistory,
  exportWeekendPlan,
};
