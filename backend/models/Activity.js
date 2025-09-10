const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },

  // Location & Logistics
  location: String,
  address: String,
  coordinates: {
    lat: Number,
    lng: Number,
  },

  // Timing & Duration
  durationMin: { type: Number, required: true },
  best_time: [
    { type: String, enum: ["morning", "afternoon", "evening", "night"] },
  ],

  // Cost & Budget
  cost_estimate: {
    min: Number,
    max: Number,
    currency: { type: String, default: "INR" },
  },
  budget_category: { type: String, enum: ["low", "medium", "premium"] },

  // Visual & Media
  icon: { type: String, default: "🎯" },
  color: { type: String, default: "#FDE68A" },
  images: [String],

  // Ratings & Reviews
  rating: { type: Number, min: 0, max: 5, default: 0 },
  review_count: { type: Number, default: 0 },

  // Tags & Classification
  vibe_tags: [String], // adventurous, relaxing, energetic, cultural, party, romantic
  companion_types: [String], // solo, family, friends, couple
  dietary_friendly: [String], // vegetarian, vegan, non-vegetarian, jain

  // Availability & Booking
  requires_booking: { type: Boolean, default: false },
  booking_url: String,
  contact_info: {
    phone: String,
    email: String,
    website: String,
  },

  // Seasonal & Weather
  seasonal: [String], // summer, winter, monsoon, all-season
  weather_dependent: { type: Boolean, default: false },

  // Accessibility & Requirements
  accessibility: {
    wheelchair_accessible: { type: Boolean, default: false },
    age_restrictions: String,
    fitness_level: { type: String, enum: ["low", "medium", "high"] },
  },

  // Admin & Status
  status: {
    type: String,
    enum: ["active", "inactive", "pending"],
    default: "active",
  },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  verified: { type: Boolean, default: false },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Activity", ActivitySchema);
