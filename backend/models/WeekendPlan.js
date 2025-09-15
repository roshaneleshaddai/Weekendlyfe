const mongoose = require("mongoose");

const WeekendPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Plan Metadata
  title: String,
  description: String,
  weekend_date: { type: Date, required: true }, // The Saturday of the weekend
  weekend_date_range: {
    start_date: { type: Date, required: true }, // Saturday
    end_date: { type: Date, required: true }, // Sunday
  },

  // Plan Status
  status: {
    type: String,
    enum: [
      "draft",
      "planning",
      "active",
      "in_progress",
      "completed",
      "cancelled",
    ],
    default: "draft",
  },

  // Activities for Saturday and Sunday - Consistent structure
  saturday_activities: [
    {
      // Unified activity data structure
      activity_data: {
        // Database reference (for internal activities) - can be ObjectId or string for temp IDs
        _id: {
          type: mongoose.Schema.Types.Mixed,
          ref: "Activity",
          required: false,
        },
        // Activity content (always present)
        title: { type: String, required: true },
        description: String,
        category: String,
        subcategory: String,
        durationMin: { type: Number, default: 60 },
        icon: String,
        color: { type: String, default: "#FDE68A" },
        images: [String],
        rating: Number,

        // Source identification
        source: String, // 'internal', 'tmdb', 'google_places', etc.
        external_id: String,

        // Location data (for places)
        location: String,
        address: String,
        coordinates: {
          lat: Number,
          lng: Number,
        },

        // Movie-specific data
        release_date: String,
        poster_path: String,
        backdrop_path: String,

        // Place-specific data
        opening_hours: Boolean,
        types: [String],
        price_level: Number,
      },

      // Plan-specific data
      order: { type: Number, default: 0 },
      startTime: { type: String, default: "09:00" },
      endTime: { type: String, default: "10:00" },
      vibe: { type: String, default: "" },
      notes: { type: String, default: "" },
      day: { type: String, default: "saturday" },

      // Completion tracking
      completed: { type: Boolean, default: false },
      rating: { type: Number, min: 1, max: 5 },
      review: String,
      photos: [String],
      cost_actual: Number,
    },
  ],

  sunday_activities: [
    {
      // Unified activity data structure
      activity_data: {
        // Database reference (for internal activities) - can be ObjectId or string for temp IDs
        _id: {
          type: mongoose.Schema.Types.Mixed,
          ref: "Activity",
          required: false,
        },
        // Activity content (always present)
        title: { type: String, required: true },
        description: String,
        category: String,
        subcategory: String,
        durationMin: { type: Number, default: 60 },
        icon: String,
        color: { type: String, default: "#FDE68A" },
        images: [String],
        rating: Number,

        // Source identification
        source: String, // 'internal', 'tmdb', 'google_places', etc.
        external_id: String,

        // Location data (for places)
        location: String,
        address: String,
        coordinates: {
          lat: Number,
          lng: Number,
        },

        // Movie-specific data
        release_date: String,
        poster_path: String,
        backdrop_path: String,

        // Place-specific data
        opening_hours: Boolean,
        types: [String],
        price_level: Number,
      },

      // Plan-specific data
      order: { type: Number, default: 0 },
      startTime: { type: String, default: "09:00" },
      endTime: { type: String, default: "10:00" },
      vibe: { type: String, default: "" },
      notes: { type: String, default: "" },
      day: { type: String, default: "sunday" },

      // Completion tracking
      completed: { type: Boolean, default: false },
      rating: { type: Number, min: 1, max: 5 },
      review: String,
      photos: [String],
      cost_actual: Number,
    },
  ],

  // Plan Summary
  total_estimated_cost: Number,
  total_actual_cost: Number,
  overall_rating: { type: Number, min: 1, max: 5 },
  overall_review: String,

  // Sharing & Social
  shared_with: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  public: { type: Boolean, default: false },
  tags: [String],

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  completedAt: Date,
});

// Index for efficient queries
WeekendPlanSchema.index({ user: 1, weekend_date: -1 });
WeekendPlanSchema.index({ status: 1 });
WeekendPlanSchema.index({ public: 1, overall_rating: -1 });

// Virtual for getting all activities
WeekendPlanSchema.virtual("all_activities").get(function () {
  return [...this.saturday_activities, ...this.sunday_activities];
});

// Method to calculate completion percentage
WeekendPlanSchema.methods.getCompletionPercentage = function () {
  const totalActivities =
    this.saturday_activities.length + this.sunday_activities.length;
  if (totalActivities === 0) return 0;

  const completedActivities = this.all_activities.filter(
    (activity) => activity.completed
  ).length;
  return Math.round((completedActivities / totalActivities) * 100);
};

// Method to calculate total duration
WeekendPlanSchema.methods.getTotalDuration = function () {
  return this.all_activities.reduce((total, planActivity) => {
    return total + (planActivity.activity_data?.durationMin || 0);
  }, 0);
};

// Indexes for better query performance
WeekendPlanSchema.index({
  user: 1,
  "weekend_date_range.start_date": 1,
  "weekend_date_range.end_date": 1,
});
WeekendPlanSchema.index({ user: 1, status: 1 });
WeekendPlanSchema.index({
  "weekend_date_range.start_date": 1,
  "weekend_date_range.end_date": 1,
});

// Unique compound index to prevent duplicate weekend plans for the same user and date range
WeekendPlanSchema.index(
  {
    user: 1,
    "weekend_date_range.start_date": 1,
    "weekend_date_range.end_date": 1,
  },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["draft", "planning"] } },
  }
);

module.exports = mongoose.model("WeekendPlan", WeekendPlanSchema);
