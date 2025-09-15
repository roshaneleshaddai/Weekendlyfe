// Frontend utility functions for weekend plan data transformation

/**
 * Calculate end time based on start time and duration
 * @param {string} startTime - Start time in HH:MM format
 * @param {number} durationMin - Duration in minutes
 * @returns {string} End time in HH:MM format
 */
export const calculateEndTime = (startTime, durationMin) => {
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + durationMin;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, "0")}:${endMinutes
    .toString()
    .padStart(2, "0")}`;
};

/**
 * Convert time to minutes for conflict checking
 * @param {string} timeStr - Time in HH:MM format
 * @returns {number} Minutes since midnight
 */
export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes to time string
 * @param {number} minutes - Minutes since midnight
 * @returns {string} Time in HH:MM format
 */
export const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};

/**
 * Normalize activity data from various sources to consistent format
 * @param {Object} activity - Activity object from any source
 * @returns {Object} Normalized activity data
 */
export const normalizeActivityData = (activity) => {
  return {
    _id:
      activity._id ||
      activity.id ||
      `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: activity.title || "Unknown Activity",
    description: activity.description || "",
    category: activity.category || "",
    subcategory: activity.subcategory || "",
    durationMin: activity.durationMin || activity.duration || 60,
    icon: activity.icon || "🎯",
    color: activity.color || "#FDE68A",
    images: activity.images || activity.photos || [],
    rating: activity.rating || null,
    source: activity.source || "internal",
    external_id: activity.external_id || activity.id || null,
    location: activity.location || "",
    address: activity.address || "",
    coordinates: activity.coordinates || null,
    release_date: activity.release_date || null,
    poster_path: activity.poster_path || null,
    backdrop_path: activity.backdrop_path || null,
    opening_hours: activity.opening_hours || null,
    types: activity.types || [],
    price_level: activity.price_level || null,
  };
};

/**
 * Convert backend plan format to frontend local format
 * @param {Object} backendPlan - Backend plan with saturday_activities/sunday_activities
 * @returns {Object} Frontend format with saturday/sunday arrays
 */
export const convertBackendPlanToLocal = (backendPlan) => {
  if (!backendPlan) {
    return { saturday: [], sunday: [] };
  }

  const convertDayActivities = (activities) => {
    return activities.map((item) => {
      const activityData = item.activity_data || {};

      return {
        _id:
          item._id ||
          `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        activity: normalizeActivityData(activityData),
        day: item.day || "saturday",
        order: item.order || 0,
        startTime: item.startTime || "09:00",
        endTime: item.endTime || "10:00",
        vibe: item.vibe || "",
        notes: item.notes || "",
        completed: item.completed || false,
        rating: item.rating || null,
        review: item.review || "",
        photos: item.photos || [],
        cost_actual: item.cost_actual || null,
      };
    });
  };

  return {
    saturday: convertDayActivities(backendPlan.saturday_activities || []),
    sunday: convertDayActivities(backendPlan.sunday_activities || []),
  };
};

/**
 * Convert frontend local plan format to backend format
 * @param {Object} localPlan - Frontend plan with saturday/sunday arrays
 * @returns {Object} Backend format with saturday_activities/sunday_activities
 */
export const convertLocalPlanToBackend = (localPlan) => {
  const convertDayActivities = (activities, day) => {
    return activities.map((item, index) => {
      const activityData = item.activity || {};

      return {
        activity_data: {
          ...normalizeActivityData(activityData),
          _id:
            activityData._id && !activityData._id.toString().startsWith("temp_")
              ? activityData._id
              : null,
        },
        order: item.order || index,
        startTime: item.startTime || "09:00",
        endTime:
          item.endTime ||
          calculateEndTime(
            item.startTime || "09:00",
            activityData.durationMin || 60
          ),
        vibe: item.vibe || "",
        notes: item.notes || "",
        day: day,
        completed: item.completed || false,
        rating: item.rating || null,
        review: item.review || "",
        photos: item.photos || [],
        cost_actual: item.cost_actual || null,
      };
    });
  };

  return {
    saturday_activities: convertDayActivities(
      localPlan.saturday || [],
      "saturday"
    ),
    sunday_activities: convertDayActivities(localPlan.sunday || [], "sunday"),
  };
};

/**
 * Check for time conflicts in a day's activities
 * @param {Array} activities - Array of activities for a day
 * @param {string} day - Day name (saturday/sunday)
 * @returns {Array} Array of conflict objects
 */
export const checkDayConflicts = (activities, day) => {
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
          activity1: item1.activity?.title || "Unknown",
          activity2: item2.activity?.title || "Unknown",
          time1: `${item1.startTime} - ${item1.endTime}`,
          time2: `${item2.startTime} - ${item2.endTime}`,
        });
      }
    }
  }
  return conflicts;
};

/**
 * Check for time conflicts in the entire plan
 * @param {Object} plan - Plan object with saturday/sunday arrays
 * @returns {Array} Array of conflict objects
 */
export const checkPlanConflicts = (plan) => {
  const saturdayConflicts = checkDayConflicts(plan.saturday || [], "saturday");
  const sundayConflicts = checkDayConflicts(plan.sunday || [], "sunday");
  return [...saturdayConflicts, ...sundayConflicts];
};

/**
 * Create a new plan item from activity data
 * @param {Object} activity - Activity data
 * @param {string} day - Day to add to
 * @param {string} startTime - Start time
 * @returns {Object} New plan item
 */
export const createPlanItem = (
  activity,
  day = "saturday",
  startTime = "09:00"
) => {
  const normalizedActivity = normalizeActivityData(activity);
  const endTime = calculateEndTime(startTime, normalizedActivity.durationMin);

  return {
    _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    activity: normalizedActivity,
    day,
    order: 0,
    startTime,
    endTime,
    vibe: "",
    notes: "",
    completed: false,
    rating: null,
    review: "",
    photos: [],
    cost_actual: null,
  };
};
