const WeekendPlan = require("../models/WeekendPlan");
const User = require("../models/User");
const Activity = require("../models/Activity");
const {
  timeToMinutes,
  minutesToTime,
  hasTimeConflict,
} = require("../utils/timeUtils");
const { generateSVGPoster } = require("../utils/exportUtils");

// Get all weekend plans for a user
const getUserWeekendPlans = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { user: req.userId };
    if (status) query.status = status;

    const plans = await WeekendPlan.find(query)
      .populate("saturday_activities.activity")
      .populate("sunday_activities.activity")
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

// Get a specific weekend plan
const getWeekendPlan = async (req, res) => {
  try {
    const plan = await WeekendPlan.findOne({
      _id: req.params.id,
      user: req.userId,
    })
      .populate("saturday_activities.activity")
      .populate("sunday_activities.activity")
      .lean();

    if (!plan) {
      return res.status(404).json({ error: "Weekend plan not found" });
    }

    res.json(plan);
  } catch (error) {
    console.error("Get weekend plan error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get current weekend plan (for this weekend)
const getCurrentWeekendPlan = async (req, res) => {
  try {
    const now = new Date();
    const currentSaturday = new Date(now);
    currentSaturday.setDate(now.getDate() - now.getDay() + 6); // Get this Saturday
    currentSaturday.setHours(0, 0, 0, 0);

    let plan = await WeekendPlan.findOne({
      user: req.userId,
      weekend_date: currentSaturday,
      status: { $in: ["draft", "active"] },
    })
      .populate("saturday_activities.activity")
      .populate("sunday_activities.activity")
      .lean();

    // If no plan exists for current weekend, create a draft
    if (!plan) {
      plan = new WeekendPlan({
        user: req.userId,
        weekend_date: currentSaturday,
        title: `Weekend Plan - ${currentSaturday.toDateString()}`,
        status: "draft",
      });
      await plan.save();

      // Populate the new plan
      plan = await WeekendPlan.findById(plan._id)
        .populate("saturday_activities.activity")
        .populate("sunday_activities.activity")
        .lean();
    }

    res.json(plan);
  } catch (error) {
    console.error("Get current weekend plan error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create or update weekend plan
const createOrUpdateWeekendPlan = async (req, res) => {
  try {
    const {
      weekend_date,
      saturday_activities = [],
      sunday_activities = [],
      title,
      description,
      status = "draft",
    } = req.body;

    if (!weekend_date) {
      return res.status(400).json({ error: "Weekend date is required" });
    }

    const weekendDate = new Date(weekend_date);
    weekendDate.setHours(0, 0, 0, 0);

    // Process activities and check for conflicts
    const processActivities = (activities, day) => {
      return activities.map((item, index) => {
        const startTime = item.startTime || "09:00";
        const activity = item.activity;
        const duration = activity?.durationMin || 60;
        const startMinutes = timeToMinutes(startTime);
        const endMinutes = startMinutes + duration;
        const endTime = minutesToTime(endMinutes);

        return {
          activity: activity._id || activity,
          order: item.order || index,
          startTime,
          endTime,
          vibe: item.vibe || "",
          notes: item.notes || "",
        };
      });
    };

    const processedSaturday = processActivities(
      saturday_activities,
      "saturday"
    );
    const processedSunday = processActivities(sunday_activities, "sunday");

    // Check for time conflicts
    const checkDayConflicts = (activities, day) => {
      const conflicts = [];
      const sortedActivities = [...activities].sort(
        (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      );

      for (let i = 0; i < sortedActivities.length; i++) {
        for (let j = i + 1; j < sortedActivities.length; j++) {
          const item1 = sortedActivities[i];
          const item2 = sortedActivities[j];

          const start1 = timeToMinutes(item1.startTime);
          const end1 = timeToMinutes(item1.endTime);
          const start2 = timeToMinutes(item2.startTime);
          const end2 = timeToMinutes(item2.endTime);

          if (start1 < end2 && start2 < end1) {
            conflicts.push({
              day,
              activity1: item1.activity,
              activity2: item2.activity,
              time1: `${item1.startTime} - ${item1.endTime}`,
              time2: `${item2.startTime} - ${item2.endTime}`,
            });
          }
        }
      }
      return conflicts;
    };

    const saturdayConflicts = checkDayConflicts(processedSaturday, "saturday");
    const sundayConflicts = checkDayConflicts(processedSunday, "sunday");
    const allConflicts = [...saturdayConflicts, ...sundayConflicts];

    if (allConflicts.length > 0) {
      return res.status(400).json({
        error: "Time conflicts detected",
        conflicts: allConflicts,
      });
    }

    // Find existing plan or create new one
    let plan = await WeekendPlan.findOne({
      user: req.userId,
      weekend_date: weekendDate,
    });

    if (plan) {
      // Update existing plan
      plan.saturday_activities = processedSaturday;
      plan.sunday_activities = processedSunday;
      plan.title = title || plan.title;
      plan.description = description || plan.description;
      plan.status = status;
      plan.updatedAt = new Date();
    } else {
      // Create new plan
      plan = new WeekendPlan({
        user: req.userId,
        weekend_date: weekendDate,
        saturday_activities: processedSaturday,
        sunday_activities: processedSunday,
        title: title || `Weekend Plan - ${weekendDate.toDateString()}`,
        description: description || "",
        status,
      });
    }

    await plan.save();

    // Return populated plan
    const populatedPlan = await WeekendPlan.findById(plan._id)
      .populate("saturday_activities.activity")
      .populate("sunday_activities.activity")
      .lean();

    res.json(populatedPlan);
  } catch (error) {
    console.error("Create/update weekend plan error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Complete a weekend plan
const completeWeekendPlan = async (req, res) => {
  try {
    const { overall_rating, overall_review, activity_reviews } = req.body;

    const plan = await WeekendPlan.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!plan) {
      return res.status(404).json({ error: "Weekend plan not found" });
    }

    // Update activity reviews if provided
    if (activity_reviews) {
      activity_reviews.forEach((review) => {
        const { activity_id, day, rating, review_text, photos, cost_actual } =
          review;

        const activities =
          day === "saturday"
            ? plan.saturday_activities
            : plan.sunday_activities;
        const activityIndex = activities.findIndex(
          (a) => a.activity.toString() === activity_id
        );

        if (activityIndex !== -1) {
          activities[activityIndex].completed = true;
          activities[activityIndex].rating = rating;
          activities[activityIndex].review = review_text;
          activities[activityIndex].photos = photos || [];
          activities[activityIndex].cost_actual = cost_actual;
        }
      });
    }

    // Update overall plan completion
    plan.status = "completed";
    plan.overall_rating = overall_rating;
    plan.overall_review = overall_review;
    plan.completedAt = new Date();
    plan.updatedAt = new Date();

    // Calculate total actual cost
    const totalCost = [
      ...plan.saturday_activities,
      ...plan.sunday_activities,
    ].reduce((sum, activity) => sum + (activity.cost_actual || 0), 0);
    plan.total_actual_cost = totalCost;

    await plan.save();

    // Update user's weekend plans history
    await User.findByIdAndUpdate(req.userId, {
      $push: {
        weekend_plans: {
          date: plan.weekend_date,
          activities: [
            ...plan.saturday_activities,
            ...plan.sunday_activities,
          ].map((a) => ({
            activity: a.activity,
            day:
              a.day ||
              (plan.saturday_activities.includes(a) ? "saturday" : "sunday"),
            startTime: a.startTime,
            endTime: a.endTime,
            completed: a.completed,
            rating: a.rating,
            notes: a.review,
          })),
        },
      },
    });

    const populatedPlan = await WeekendPlan.findById(plan._id)
      .populate("saturday_activities.activity")
      .populate("sunday_activities.activity")
      .lean();

    res.json(populatedPlan);
  } catch (error) {
    console.error("Complete weekend plan error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get user's activity history and statistics
const getUserHistory = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate("weekend_plans.activities.activity")
      .lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const completedPlans = await WeekendPlan.find({
      user: req.userId,
      status: "completed",
    })
      .populate("saturday_activities.activity")
      .populate("sunday_activities.activity")
      .sort({ weekend_date: -1 })
      .lean();

    // Calculate statistics
    const stats = {
      total_weekends_planned: completedPlans.length,
      total_activities_completed: completedPlans.reduce((sum, plan) => {
        return (
          sum +
          plan.saturday_activities.filter((a) => a.completed).length +
          plan.sunday_activities.filter((a) => a.completed).length
        );
      }, 0),
      average_rating: 0,
      total_money_spent: completedPlans.reduce(
        (sum, plan) => sum + (plan.total_actual_cost || 0),
        0
      ),
      favorite_activities: {},
      favorite_vibes: {},
      monthly_activity: {},
    };

    // Calculate average rating
    const ratedPlans = completedPlans.filter((p) => p.overall_rating);
    if (ratedPlans.length > 0) {
      stats.average_rating =
        ratedPlans.reduce((sum, p) => sum + p.overall_rating, 0) /
        ratedPlans.length;
    }

    // Calculate favorite activities and vibes
    completedPlans.forEach((plan) => {
      [...plan.saturday_activities, ...plan.sunday_activities].forEach(
        (activity) => {
          if (activity.completed && activity.activity) {
            const activityName = activity.activity.title;
            stats.favorite_activities[activityName] =
              (stats.favorite_activities[activityName] || 0) + 1;

            if (activity.vibe) {
              stats.favorite_vibes[activity.vibe] =
                (stats.favorite_vibes[activity.vibe] || 0) + 1;
            }
          }
        }
      );

      // Monthly activity tracking
      const month = plan.weekend_date.toISOString().substring(0, 7); // YYYY-MM
      stats.monthly_activity[month] = (stats.monthly_activity[month] || 0) + 1;
    });

    res.json({
      history: completedPlans,
      statistics: stats,
      user_preferences: {
        preferred_activities: user.preferred_activities,
        budget_range: user.budget_range,
        companions: user.companions,
        preferred_vibe: user.preferred_vibe,
        dietary_preferences: user.dietary_preferences,
      },
    });
  } catch (error) {
    console.error("Get user history error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Export weekend plan as SVG
const exportWeekendPlan = async (req, res) => {
  try {
    const plan = await WeekendPlan.findOne({
      _id: req.params.id,
      user: req.userId,
    })
      .populate("saturday_activities.activity")
      .populate("sunday_activities.activity")
      .lean();

    if (!plan) {
      return res.status(404).json({ error: "Weekend plan not found" });
    }

    // Convert to old format for SVG generation
    const items = [
      ...plan.saturday_activities.map((a) => ({
        ...a,
        day: "saturday",
      })),
      ...plan.sunday_activities.map((a) => ({
        ...a,
        day: "sunday",
      })),
    ];

    const svg = generateSVGPoster(items);
    res.setHeader("Content-Type", "image/svg+xml");
    res.send(svg);
  } catch (error) {
    console.error("Export weekend plan error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUserWeekendPlans,
  getWeekendPlan,
  getCurrentWeekendPlan,
  createOrUpdateWeekendPlan,
  completeWeekendPlan,
  getUserHistory,
  exportWeekendPlan,
};
