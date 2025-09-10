const mongoose = require("mongoose");

const PlanItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  activity: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
  day: String,
  order: Number,
  startTime: String,
  endTime: String,
  vibe: String,
  theme: String,
  notes: String,
});

module.exports = mongoose.model("PlanItem", PlanItemSchema);
