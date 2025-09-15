// Utility functions for weekend plan data transformation

/**
 * Convert frontend local plan format to backend format
 * @param {Object} localPlan - Frontend plan with saturday/sunday arrays
 * @returns {Object} Backend format with saturday_activities/sunday_activities
 */
const convertLocalPlanToBackend = (localPlan) => {
  const convertDayActivities = (activities, day) => {
    return activities.map((item, index) => {
      const activityData = item.activity || item.external_activity || {};

      return {
        activity_data: {
          _id:
            activityData._id && !activityData._id.toString().startsWith("temp_")
              ? activityData._id
              : null,
          title: activityData.title || "Unknown Activity",
          description: activityData.description || "",
          category: activityData.category || "",
          subcategory: activityData.subcategory || "",
          durationMin: activityData.durationMin || 60,
          icon: activityData.icon || "🎯",
          color: activityData.color || "#FDE68A",
          images: activityData.images || [],
          rating: activityData.rating || null,
          source: activityData.source || "internal",
          external_id: activityData.external_id || null,
          location: activityData.location || "",
          address: activityData.address || "",
          coordinates: activityData.coordinates || null,
          release_date: activityData.release_date || null,
          poster_path: activityData.poster_path || null,
          backdrop_path: activityData.backdrop_path || null,
          opening_hours: activityData.opening_hours || null,
          types: activityData.types || [],
          price_level: activityData.price_level || null,
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
 * Convert backend plan format to frontend local format
 * @param {Object} backendPlan - Backend plan with saturday_activities/sunday_activities
 * @returns {Object} Frontend format with saturday/sunday arrays
 */
const convertBackendPlanToLocal = (backendPlan) => {
  const convertDayActivities = (activities) => {
    return activities.map((item) => {
      const activityData = item.activity_data || {};

      return {
        _id:
          item._id ||
          `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        activity: {
          _id: activityData._id,
          title: activityData.title,
          description: activityData.description,
          category: activityData.category,
          subcategory: activityData.subcategory,
          durationMin: activityData.durationMin,
          icon: activityData.icon,
          color: activityData.color,
          images: activityData.images,
          rating: activityData.rating,
          source: activityData.source,
          external_id: activityData.external_id,
          location: activityData.location,
          address: activityData.address,
          coordinates: activityData.coordinates,
          release_date: activityData.release_date,
          poster_path: activityData.poster_path,
          backdrop_path: activityData.backdrop_path,
          opening_hours: activityData.opening_hours,
          types: activityData.types,
          price_level: activityData.price_level,
        },
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
 * Calculate end time based on start time and duration
 * @param {string} startTime - Start time in HH:MM format
 * @param {number} durationMin - Duration in minutes
 * @returns {string} End time in HH:MM format
 */
const calculateEndTime = (startTime, durationMin) => {
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
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes to time string
 * @param {number} minutes - Minutes since midnight
 * @returns {string} Time in HH:MM format
 */
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};

/**
 * Check for time conflicts in a day's activities
 * @param {Array} activities - Array of activities for a day
 * @param {string} day - Day name (saturday/sunday)
 * @returns {Array} Array of conflict objects
 */
const checkDayConflicts = (activities, day) => {
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
          activity1: item1.activity_data?.title || "Unknown",
          activity2: item2.activity_data?.title || "Unknown",
          time1: `${item1.startTime} - ${item1.endTime}`,
          time2: `${item2.startTime} - ${item2.endTime}`,
        });
      }
    }
  }
  return conflicts;
};

/**
 * Normalize activity data from various sources
 * @param {Object} activity - Activity object from any source
 * @returns {Object} Normalized activity data
 */
const normalizeActivityData = (activity) => {
  return {
    _id:
      (activity._id || activity.id) &&
      !(activity._id || activity.id).toString().startsWith("temp_")
        ? activity._id || activity.id
        : null,
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

module.exports = {
  convertLocalPlanToBackend,
  convertBackendPlanToLocal,
  calculateEndTime,
  timeToMinutes,
  minutesToTime,
  checkDayConflicts,
  normalizeActivityData,
};
