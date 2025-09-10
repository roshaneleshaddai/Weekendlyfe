const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },

  // Contact Info
  phone: String,
  location: String,

  // User Preferences
  preferred_activities: [String],
  budget_range: {
    type: String,
    enum: ["low", "medium", "premium"],
    default: "medium",
  },
  companions: [String],
  preferred_vibe: [String],
  dietary_preferences: [String],

  // Profile Info
  avatar: String,
  bio: String,

  // Activity History
  weekend_plans: [
    {
      date: Date,
      activities: [
        {
          activity: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
          day: { type: String, enum: ["saturday", "sunday"] },
          startTime: String,
          endTime: String,
          completed: { type: Boolean, default: false },
          rating: { type: Number, min: 1, max: 5 },
          notes: String,
        },
      ],
    },
  ],

  // Settings
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true },
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("User", UserSchema);
