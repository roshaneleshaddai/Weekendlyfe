/**
 * Seed script to populate example activities
 */
const mongoose = require("mongoose");
require("dotenv").config();
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/weekendly";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const ActivitySchema = new mongoose.Schema({
  title: String,
  category: String,
  durationMin: Number,
  color: String,
  icon: String,
  description: String,
  image: String,
});
const Activity = mongoose.model("Activity", ActivitySchema);

async function seed() {
  await Activity.deleteMany({});
  const items = [
    {
      title: "Brunch at Cafe",
      category: "Food",
      durationMin: 90,
      color: "#FDE68A",
      icon: "☕",
      description: "Cozy brunch with friends.",
    },
    {
      title: "Hiking",
      category: "Outdoors",
      durationMin: 180,
      color: "#BBF7D0",
      icon: "🥾",
      description: "Short mountain trail.",
    },
    {
      title: "Movie Night",
      category: "Entertainment",
      durationMin: 150,
      color: "#C7D2FE",
      icon: "🎬",
      description: "Watch a new release.",
    },
    {
      title: "Reading",
      category: "Chill",
      durationMin: 60,
      color: "#FAD9E8",
      icon: "📚",
      description: "Read a novel chapter.",
    },
    {
      title: "Board Games",
      category: "Social",
      durationMin: 120,
      color: "#FDE68A",
      icon: "🎲",
      description: "Play games with friends.",
    },
    {
      title: "Cycling",
      category: "Fitness",
      durationMin: 90,
      color: "#D1FAE5",
      icon: "🚴",
      description: "City cycling route.",
    },
  ];
  await Activity.insertMany(items);
  console.log("Seeded activities");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
