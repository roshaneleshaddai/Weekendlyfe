function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
}

// Helper function to check time conflicts
function hasTimeConflict(items, newItem) {
  if (!newItem.startTime || !newItem.endTime) return false;

  return items.some((item) => {
    if (!item.startTime || !item.endTime || item._id === newItem._id)
      return false;

    const newStart = timeToMinutes(newItem.startTime);
    const newEnd = timeToMinutes(newItem.endTime);
    const itemStart = timeToMinutes(item.startTime);
    const itemEnd = timeToMinutes(item.endTime);

    // Check for overlap: new activity starts before existing ends AND new activity ends after existing starts
    return newStart < itemEnd && newEnd > itemStart;
  });
}

module.exports = {
  timeToMinutes,
  minutesToTime,
  hasTimeConflict,
};
