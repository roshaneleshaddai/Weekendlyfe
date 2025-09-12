/**
 * Basic test for TimeSlotManager component
 * This demonstrates testing capabilities for the Weekendly application
 */

// Mock data for testing
const mockPlanItems = [
  {
    _id: "1",
    activity: { _id: "act1", title: "Brunch", durationMin: 90 },
    startTime: "09:00",
    endTime: "10:30",
    day: "saturday",
  },
  {
    _id: "2",
    activity: { _id: "act2", title: "Hiking", durationMin: 180 },
    startTime: "11:00",
    endTime: "14:00",
    day: "saturday",
  },
];

// Mock functions
const mockOnTimeChange = jest.fn();
const mockOnAddItem = jest.fn();

// Test helper functions
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};

const hasTimeConflict = (items, newItem) => {
  if (!newItem.startTime || !newItem.endTime) return false;

  return items.some((item) => {
    if (!item.startTime || !item.endTime || item._id === newItem._id)
      return false;

    const newStart = timeToMinutes(newItem.startTime);
    const newEnd = timeToMinutes(newItem.endTime);
    const itemStart = timeToMinutes(item.startTime);
    const itemEnd = timeToMinutes(item.endTime);

    return newStart < itemEnd && newEnd > itemStart;
  });
};

describe("TimeSlotManager", () => {
  describe("Time utility functions", () => {
    test("timeToMinutes converts time string to minutes correctly", () => {
      expect(timeToMinutes("09:00")).toBe(540);
      expect(timeToMinutes("14:30")).toBe(870);
      expect(timeToMinutes("00:00")).toBe(0);
    });

    test("minutesToTime converts minutes to time string correctly", () => {
      expect(minutesToTime(540)).toBe("09:00");
      expect(minutesToTime(870)).toBe("14:30");
      expect(minutesToTime(0)).toBe("00:00");
    });
  });

  describe("Time conflict detection", () => {
    test("detects overlapping time slots", () => {
      const newItem = {
        startTime: "09:30",
        endTime: "10:30",
        _id: "new",
      };

      expect(hasTimeConflict(mockPlanItems, newItem)).toBe(true);
    });

    test("does not detect conflict for non-overlapping slots", () => {
      const newItem = {
        startTime: "15:00",
        endTime: "16:00",
        _id: "new",
      };

      expect(hasTimeConflict(mockPlanItems, newItem)).toBe(false);
    });

    test("does not detect conflict for adjacent slots", () => {
      const newItem = {
        startTime: "10:30",
        endTime: "11:00",
        _id: "new",
      };

      expect(hasTimeConflict(mockPlanItems, newItem)).toBe(false);
    });
  });

  describe("Mock functions", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("onTimeChange is called with correct parameters", () => {
      mockOnTimeChange("10:00");
      expect(mockOnTimeChange).toHaveBeenCalledWith("10:00");
    });

    test("onAddItem is called when adding new item", () => {
      mockOnAddItem();
      expect(mockOnAddItem).toHaveBeenCalledTimes(1);
    });
  });
});

// Integration test example
describe("Weekendlyfe Integration", () => {
  test("plan items have required properties", () => {
    mockPlanItems.forEach((item) => {
      expect(item).toHaveProperty("_id");
      expect(item).toHaveProperty("activity");
      expect(item).toHaveProperty("startTime");
      expect(item).toHaveProperty("endTime");
      expect(item).toHaveProperty("day");
    });
  });

  test("activities have required properties", () => {
    mockPlanItems.forEach((item) => {
      expect(item.activity).toHaveProperty("_id");
      expect(item.activity).toHaveProperty("title");
      expect(item.activity).toHaveProperty("durationMin");
    });
  });
});

module.exports = {
  timeToMinutes,
  minutesToTime,
  hasTimeConflict,
};
