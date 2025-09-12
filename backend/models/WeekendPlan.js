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

  // Activities for Saturday and Sunday
  saturday_activities: [
    {
      activity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
        required: false, // Made optional to allow external activities
      },
      // External activity data (when activity is not a database reference)
      external_activity: {
        id: String,
        title: String,
        description: String,
        category: String,
        subcategory: String,
        durationMin: Number,
        icon: String,
        color: String,
        images: [String],
        rating: Number,
        source: String, // 'tmdb', 'google_places', etc.
        external_id: String,
        location: String,
        address: String,
        coordinates: {
          lat: Number,
          lng: Number,
        },
        release_date: String, // For movies
        poster_path: String, // For movies
        backdrop_path: String, // For movies
        opening_hours: Boolean, // For places
        types: [String], // For places
      },
      order: { type: Number, default: 0 },
      startTime: String,
      endTime: String,
      vibe: String,
      notes: String,

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
      activity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
        required: false, // Made optional to allow external activities
      },
      // External activity data (when activity is not a database reference)
      external_activity: {
        id: String,
        title: String,
        description: String,
        category: String,
        subcategory: String,
        durationMin: Number,
        icon: String,
        color: String,
        images: [String],
        rating: Number,
        source: String, // 'tmdb', 'google_places', etc.
        external_id: String,
        location: String,
        address: String,
        coordinates: {
          lat: Number,
          lng: Number,
        },
        release_date: String, // For movies
        poster_path: String, // For movies
        backdrop_path: String, // For movies
        opening_hours: Boolean, // For places
        types: [String], // For places
      },
      order: { type: Number, default: 0 },
      startTime: String,
      endTime: String,
      vibe: String,
      notes: String,

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
    return total + (planActivity.activity?.durationMin || 0);
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
