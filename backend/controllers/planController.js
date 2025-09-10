const PlanItem = require("../models/PlanItem");
const {
  timeToMinutes,
  minutesToTime,
  hasTimeConflict,
} = require("../utils/timeUtils");
const { generateSVGPoster } = require("../utils/exportUtils");

const getPlan = async (req, res) => {
  try {
    const items = await PlanItem.find({ user: req.userId })
      .populate("activity")
      .lean();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createPlan = async (req, res) => {
  try {
    const bulk = req.body;
    await PlanItem.deleteMany({ user: req.userId });

    if (Array.isArray(bulk) && bulk.length) {
      // Calculate end times and check for conflicts
      const processedItems = bulk.map((it) => {
        const startTime = it.startTime || "09:00";
        const duration = it.activity?.durationMin || 60;
        const startMinutes = timeToMinutes(startTime);
        const endMinutes = startMinutes + duration;
        const endTime = minutesToTime(endMinutes);

        return {
          user: req.userId,
          activity: it.activity,
          day: it.day,
          order: it.order,
          startTime,
          endTime,
          vibe: it.vibe || "",
          theme: it.theme || "",
          notes: it.notes || "",
        };
      });

      // Check for conflicts within each day
      const conflicts = [];
      const dayGroups = processedItems.reduce((acc, item) => {
        if (!acc[item.day]) acc[item.day] = [];
        acc[item.day].push(item);
        return acc;
      }, {});

      Object.keys(dayGroups).forEach((day) => {
        const dayItems = dayGroups[day];
        // Sort by start time for proper conflict detection
        dayItems.sort(
          (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
        );

        dayItems.forEach((item, index) => {
          if (hasTimeConflict(dayItems.slice(0, index), item)) {
            conflicts.push({
              day,
              activity: item.activity?.title || "Unknown",
              startTime: item.startTime,
              endTime: item.endTime,
            });
          }
        });
      });

      if (conflicts.length > 0) {
        return res.status(400).json({
          error: "Time conflicts detected",
          conflicts,
        });
      }

      await PlanItem.insertMany(processedItems);
    }

    const items = await PlanItem.find({ user: req.userId })
      .populate("activity")
      .lean();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletePlanItem = async (req, res) => {
  try {
    await PlanItem.deleteOne({ _id: req.params.id, user: req.userId });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const exportPlan = async (req, res) => {
  try {
    const items = await PlanItem.find({ user: req.userId })
      .populate("activity")
      .lean();

    const svg = generateSVGPoster(items);
    res.setHeader("Content-Type", "image/svg+xml");
    res.send(svg);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPlan,
  createPlan,
  deletePlanItem,
  exportPlan,
};
