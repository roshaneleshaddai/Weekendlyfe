// Weekend Plan Controller using MongoDB
const WeekendPlan = require("../models/WeekendPlan");
const User = require("../models/User");
const Activity = require("../models/Activity");
const {
  convertLocalPlanToBackend,
  convertBackendPlanToLocal,
  calculateEndTime,
  timeToMinutes,
  checkDayConflicts,
  normalizeActivityData,
} = require("../utils/weekendPlanUtils");

// Get current weekend plan
const getCurrentWeekendPlan = async (req, res) => {
  try {
    const now = new Date();
    const currentSaturday = new Date(now);
    currentSaturday.setDate(now.getDate() - now.getDay() + 6); // Get this Saturday
    currentSaturday.setHours(0, 0, 0, 0);

    const currentSunday = new Date(currentSaturday);
    currentSunday.setDate(currentSaturday.getDate() + 1); // Next day (Sunday)
    currentSunday.setHours(0, 0, 0, 0);

    let plan = await WeekendPlan.findOne({
      user: req.userId,
      "weekend_date_range.start_date": { $lte: currentSunday },
      "weekend_date_range.end_date": { $gte: currentSaturday },
      status: { $in: ["draft", "planning"] },
    })
      .populate("saturday_activities.activity_data._id")
      .populate("sunday_activities.activity_data._id")
      .lean();

    // If no plan exists for current weekend, create a draft
    if (!plan) {
      try {
        const newPlan = new WeekendPlan({
          user: req.userId,
          weekend_date: currentSaturday,
          weekend_date_range: {
            start_date: currentSaturday,
            end_date: currentSunday,
          },
          title: `Weekend Plan - ${currentSaturday.toDateString()} to ${currentSunday.toDateString()}`,
          status: "planning",
          saturday_activities: [],
          sunday_activities: [],
        });
        await newPlan.save();

        // Populate the new plan
        plan = await WeekendPlan.findById(newPlan._id)
          .populate("saturday_activities.activity_data._id")
          .populate("sunday_activities.activity_data._id")
          .lean();
      } catch (error) {
        // If duplicate key error, try to find the existing plan
        if (error.code === 11000) {
          plan = await WeekendPlan.findOne({
            user: req.userId,
            "weekend_date_range.start_date": { $lte: currentSunday },
            "weekend_date_range.end_date": { $gte: currentSaturday },
            status: { $in: ["draft", "planning"] },
          })
            .populate("saturday_activities.activity_data._id")
            .populate("sunday_activities.activity_data._id")
            .lean();
        } else {
          throw error;
        }
      }
    }

    res.json(plan);
  } catch (error) {
    console.error("Get current weekend plan error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get weekend plan by specific date (finds weekend containing the date)
const getWeekendPlanByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const targetDate = new Date(date);

    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Set time to start of day for accurate comparison
    targetDate.setHours(0, 0, 0, 0);

    // Find the Saturday of the weekend containing this date
    const dayOfWeek = targetDate.getDay();
    let saturdayOffset;
    if (dayOfWeek === 0) {
      // Sunday: go back 1 day to get Saturday
      saturdayOffset = -1;
    } else if (dayOfWeek === 6) {
      // Saturday: already Saturday, no offset needed
      saturdayOffset = 0;
    } else {
      // Monday-Friday: go back to previous Saturday
      saturdayOffset = -(dayOfWeek + 1);
    }

    const saturday = new Date(targetDate);
    saturday.setDate(targetDate.getDate() + saturdayOffset);
    saturday.setHours(0, 0, 0, 0);

    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);
    sunday.setHours(0, 0, 0, 0);

    let plan = await WeekendPlan.findOne({
      user: req.userId,
      weekend_date: saturday, // Look for exact Saturday match
    })
      .populate("saturday_activities.activity_data._id")
      .populate("sunday_activities.activity_data._id")
      .lean();

    // If no plan exists for this weekend, create a draft
    if (!plan) {
      try {
        const newPlan = new WeekendPlan({
          user: req.userId,
          weekend_date: saturday,
          weekend_date_range: {
            start_date: saturday,
            end_date: sunday,
          },
          title: `Weekend Plan - ${saturday.toDateString()} to ${sunday.toDateString()}`,
          status: "planning",
          saturday_activities: [],
          sunday_activities: [],
        });
        await newPlan.save();

        // Populate the new plan
        plan = await WeekendPlan.findById(newPlan._id)
          .populate("saturday_activities.activity_data._id")
          .populate("sunday_activities.activity_data._id")
          .lean();
      } catch (error) {
        // If duplicate key error, try to find the existing plan
        if (error.code === 11000) {
          plan = await WeekendPlan.findOne({
            user: req.userId,
            weekend_date: saturday, // Look for exact Saturday match
          })
            .populate("saturday_activities.activity_data._id")
            .populate("sunday_activities.activity_data._id")
            .lean();
        } else {
          throw error;
        }
      }
    }

    res.json(plan);
  } catch (error) {
    console.error("Get weekend plan by date error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get user history
const getUserHistory = async (req, res) => {
  try {
    const { date } = req.query;

    // Build query object
    const query = { user: req.userId };

    // If date is provided, filter by that specific date
    if (date) {
      query.weekend_date = date;
    }

    const plans = await WeekendPlan.find(query)
      .populate("saturday_activities.activity_data._id")
      .populate("sunday_activities.activity_data._id")
      .sort({ weekend_date: -1 })
      .lean();

    const completedPlans = plans.filter((plan) => plan.status === "completed");

    // Calculate average rating
    const ratings = completedPlans
      .filter((plan) => plan.overall_rating)
      .map((plan) => plan.overall_rating);
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;

    const history = {
      stats: {
        total_plans: plans.length,
        completed_plans: completedPlans.length,
        average_rating: averageRating,
      },
      plans: plans,
    };

    res.json(history);
  } catch (error) {
    console.error("Get user history error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create or update weekend plan
const createOrUpdateWeekendPlan = async (req, res) => {
  try {
    const {
      weekend_date,
      saturday_activities,
      sunday_activities,
      status,
      tags,
    } = req.body;

    const targetDate = new Date(weekend_date);
    targetDate.setHours(0, 0, 0, 0);

    // Find the Saturday of the weekend containing this date
    const dayOfWeek = targetDate.getDay();
    let saturdayOffset;
    if (dayOfWeek === 0) {
      // Sunday: go back 1 day to get Saturday
      saturdayOffset = -1;
    } else if (dayOfWeek === 6) {
      // Saturday: already Saturday, no offset needed
      saturdayOffset = 0;
    } else {
      // Monday-Friday: go back to previous Saturday
      saturdayOffset = -(dayOfWeek + 1);
    }

    const saturday = new Date(targetDate);
    saturday.setDate(targetDate.getDate() + saturdayOffset);
    saturday.setHours(0, 0, 0, 0);

    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);
    sunday.setHours(0, 0, 0, 0);

    // Check for time conflicts before saving
    const saturdayConflicts = checkDayConflicts(
      saturday_activities || [],
      "saturday"
    );
    const sundayConflicts = checkDayConflicts(
      sunday_activities || [],
      "sunday"
    );
    const allConflicts = [...saturdayConflicts, ...sundayConflicts];

    if (allConflicts.length > 0) {
      return res.status(400).json({
        error: "Time conflicts detected",
        conflicts: allConflicts,
      });
    }

    // Find existing plan for this exact weekend date
    let plan = await WeekendPlan.findOne({
      user: req.userId,
      weekend_date: saturday, // Look for exact Saturday match
    });

    if (plan) {
      // Update existing plan
      plan.saturday_activities = saturday_activities || [];
      plan.sunday_activities = sunday_activities || [];
      plan.status = status || plan.status;
      plan.tags = tags || plan.tags || [];
      plan.updatedAt = new Date();

      await plan.save();

      // Populate the updated plan
      plan = await WeekendPlan.findById(plan._id)
        .populate("saturday_activities.activity_data._id")
        .populate("sunday_activities.activity_data._id")
        .lean();
    } else {
      // Create new plan
      try {
        const newPlan = new WeekendPlan({
          user: req.userId,
          weekend_date: saturday,
          weekend_date_range: {
            start_date: saturday,
            end_date: sunday,
          },
          title: `Weekend Plan - ${saturday.toDateString()} to ${sunday.toDateString()}`,
          status: status || "planning",
          saturday_activities: saturday_activities || [],
          sunday_activities: sunday_activities || [],
          tags: tags || [],
        });

        await newPlan.save();

        // Populate the new plan
        plan = await WeekendPlan.findById(newPlan._id)
          .populate("saturday_activities.activity_data._id")
          .populate("sunday_activities.activity_data._id")
          .lean();
      } catch (error) {
        // If duplicate key error, try to find and update the existing plan
        if (error.code === 11000) {
          plan = await WeekendPlan.findOne({
            user: req.userId,
            "weekend_date_range.start_date": { $lte: sunday },
            "weekend_date_range.end_date": { $gte: saturday },
          });

          if (plan) {
            // Update existing plan
            plan.saturday_activities = saturday_activities || [];
            plan.sunday_activities = sunday_activities || [];
            plan.status = status || plan.status;
            plan.tags = tags || plan.tags || [];
            plan.updatedAt = new Date();

            await plan.save();

            // Populate the updated plan
            plan = await WeekendPlan.findById(plan._id)
              .populate("saturday_activities.activity_data._id")
              .populate("sunday_activities.activity_data._id")
              .lean();
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
    }

    res.json(plan);
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

// Get all weekend plans with pagination
const getUserWeekendPlans = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { user: req.userId };
    if (status) query.status = status;

    const plans = await WeekendPlan.find(query)
      .populate("saturday_activities.activity_data._id")
      .populate("sunday_activities.activity_data._id")
      .sort({ weekend_date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await WeekendPlan.countDocuments(query);

    res.json({
      plans,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / limit),
        total_plans: total,
        has_next: skip + plans.length < total,
        has_prev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get weekend plans error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get specific weekend plan
const getWeekendPlan = async (req, res) => {
  try {
    const plan = await WeekendPlan.findOne({
      _id: req.params.id,
      user: req.userId,
    })
      .populate("saturday_activities.activity_data._id")
      .populate("sunday_activities.activity_data._id")
      .lean();

    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

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
    const plan = await WeekendPlan.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    plan.status = status;
    plan.updatedAt = new Date();

    if (status === "completed") {
      plan.completedAt = new Date();
    }

    await plan.save();

    // Populate the updated plan
    const updatedPlan = await WeekendPlan.findById(plan._id)
      .populate("saturday_activities.activity_data._id")
      .populate("sunday_activities.activity_data._id")
      .lean();

    res.json(updatedPlan);
  } catch (error) {
    console.error("Update plan status error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Complete weekend plan
const completeWeekendPlan = async (req, res) => {
  try {
    const plan = await WeekendPlan.findOne({
      _id: req.params.id,
      user: req.userId,
    });

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

    await plan.save();

    // Populate the completed plan
    const completedPlan = await WeekendPlan.findById(plan._id)
      .populate("saturday_activities.activity_data._id")
      .populate("sunday_activities.activity_data._id")
      .lean();

    res.json(completedPlan);
  } catch (error) {
    console.error("Complete weekend plan error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUserWeekendPlans,
  getWeekendPlan,
  getCurrentWeekendPlan,
  getWeekendPlanByDate,
  createOrUpdateWeekendPlan,
  updatePlanStatus,
  completeWeekendPlan,
  getUserHistory,
  exportWeekendPlan,
};
