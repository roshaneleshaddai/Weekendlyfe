const mongoose = require("mongoose");

const WeekendPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Plan Metadata
  title: String,
  description: String,
  weekend_date: { type: Date, required: true }, // The Saturday of the weekend

  // Plan Status
  status: {
    type: String,
    enum: ["draft", "active", "completed", "cancelled"],
    default: "draft",
  },

  // Activities for Saturday and Sunday
  saturday_activities: [
    {
      activity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
        required: true,
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
        required: true,
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

module.exports = mongoose.model("WeekendPlan", WeekendPlanSchema);
