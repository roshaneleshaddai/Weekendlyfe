"use client";
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { useAuth } from "../lib/AuthContext";
import ActivityForm from "./ActivityForm";
import apiService, { activityAPI } from "../lib/apiService";

const ActivityCard = ({
  activity,
  onAdd,
  onEdit,
  onDelete,
  isAuthenticated,
  showTimeSelector = false,
  existingPlan = { saturday: [], sunday: [] },
  index,
  isDragging = false,
  activityStats = null,
  showStats = false,
}) => {
  const [showTimeForm, setShowTimeForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState("sunday");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("");
  const [conflictError, setConflictError] = useState("");

  const calculateEndTime = (start, duration) => {
    const [hours, minutes] = start.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMins
      .toString()
      .padStart(2, "0")}`;
  };

  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const checkTimeConflict = (newStartTime, newEndTime, day) => {
    const dayItems = existingPlan[day] || [];
    const newStart = timeToMinutes(newStartTime);
    const newEnd = timeToMinutes(newEndTime);

    for (const item of dayItems) {
      if (item.startTime && item.endTime) {
        const itemStart = timeToMinutes(item.startTime);
        const itemEnd = timeToMinutes(item.endTime);

        // Check for overlap: new activity starts before existing ends AND new activity ends after existing starts
        if (newStart < itemEnd && newEnd > itemStart) {
          return {
            hasConflict: true,
            conflictingActivity: item.activity?.title || "Unknown Activity",
            conflictingTime: `${item.startTime} - ${item.endTime}`,
          };
        }
      }
    }
    return { hasConflict: false };
  };

  const handleAddClick = () => {
    if (showTimeSelector) {
      setShowTimeForm(true);
      setEndTime(calculateEndTime(startTime, activity.durationMin));
    } else {
      onAdd(activity);
    }
  };

  const handleConfirmAdd = () => {
    const finalEndTime =
      endTime || calculateEndTime(startTime, activity.durationMin);
    const conflict = checkTimeConflict(startTime, finalEndTime, selectedDay);

    if (conflict.hasConflict) {
      setConflictError(
        `Time conflict! This activity overlaps with "${conflict.conflictingActivity}" (${conflict.conflictingTime}). Please choose a different time.`
      );
      return;
    }

    setConflictError("");
    const activityWithTime = {
      ...activity,
      day: selectedDay,
      startTime,
      endTime: finalEndTime,
    };
    onAdd(activityWithTime);
    setShowTimeForm(false);
  };

  const handleStartTimeChange = (e) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    setEndTime(calculateEndTime(newStartTime, activity.durationMin));
    setConflictError(""); // Clear any previous conflict errors
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-zen-white rounded-xl shadow-sm border border-zen-light-gray overflow-hidden hover:shadow-lg transition-all duration-200 ${
        isDragging ? "rotate-2 scale-105 shadow-xl" : ""
      }`}
    >
      <div className="relative">
        {activity.image && (
          <div
            className="h-32 bg-cover bg-center"
            style={{ backgroundImage: `url(${activity.image})` }}
          >
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        )}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{activity.icon}</span>
              <div>
                <h3 className="font-semibold text-zen-black">
                  {activity.title}
                </h3>
                <p className="text-sm text-zen-black">{activity.category}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-zen-light-gray text-zen-black px-2 py-1 rounded-full">
                {activity.durationMin}m
              </span>
              {/* Drag indicator */}
              <div className="text-zen-black cursor-grab">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8h16M4 16h16"
                  />
                </svg>
              </div>
              {isAuthenticated && (
                <div className="flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(activity);
                    }}
                    className="btn btn-icon btn-secondary"
                    title="Edit activity"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(activity._id);
                    }}
                    className="btn btn-icon btn-danger"
                    title="Delete activity"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="text-sm text-zen-black mb-3 line-clamp-2">
            {activity.description}
          </p>

          {/* Activity Statistics */}
          {showStats && activityStats && (
            <div className="mb-3 p-2 bg-zen-light-gray rounded-lg">
              <div className="flex items-center justify-between text-xs text-zen-black">
                <span>Used: {activityStats.usage_count} times</span>
                {activityStats.avg_rating > 0 && (
                  <span>
                    Avg Rating:{" "}
                    {"⭐".repeat(Math.round(activityStats.avg_rating))}
                  </span>
                )}
              </div>
            </div>
          )}

          {showTimeForm ? (
            <div className="space-y-3 mb-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-zen-black block mb-1">
                    Day
                  </label>
                  <select
                    value={selectedDay}
                    onChange={(e) => {
                      setSelectedDay(e.target.value);
                      setConflictError(""); // Clear conflict errors when day changes
                    }}
                    className="w-full px-2 py-1 border border-zen-light-gray rounded text-xs focus:outline-none focus:ring-1 focus:ring-zen-lime"
                  >
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-zen-black block mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={handleStartTimeChange}
                    className="w-full px-2 py-1 border border-zen-light-gray rounded text-xs focus:outline-none focus:ring-1 focus:ring-zen-lime"
                  />
                </div>
              </div>
              <div className="text-xs text-zen-black">
                End Time:{" "}
                {endTime || calculateEndTime(startTime, activity.durationMin)}
              </div>
              {conflictError && (
                <div className="p-2 bg-zen-light-gray border border-zen-black rounded text-xs text-zen-black">
                  {conflictError}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmAdd}
                  disabled={!isAuthenticated}
                  className={
                    isAuthenticated
                      ? "btn btn-primary flex-1 text-xs"
                      : "btn btn-disabled flex-1 text-xs"
                  }
                >
                  Confirm Add
                </button>
                <button
                  onClick={() => setShowTimeForm(false)}
                  className="btn btn-outline text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div
                className="w-4 h-4 rounded-full border-2"
                style={{ backgroundColor: activity.color }}
              ></div>
              <button
                onClick={handleAddClick}
                disabled={!isAuthenticated}
                className={
                  isAuthenticated ? "btn btn-primary" : "btn btn-disabled"
                }
              >
                {isAuthenticated ? "Add to Plan" : "Login to Add"}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function ActivitiesPanel({
  activities,
  onAdd,
  onActivityUpdate,
  selectedTheme,
  showTimeSelector = false,
  existingPlan = { saturday: [], sunday: [] },
  userHistory,
}) {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [enableTimeSelector, setEnableTimeSelector] = useState(true);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showActivityHistory, setShowActivityHistory] = useState(false);

  const categories = useMemo(() => {
    const cats = [...new Set(activities.map((act) => act.category))];
    return ["all", ...cats];
  }, [activities]);

  // Get activity usage statistics from user history
  const getActivityStats = (activityId) => {
    if (!userHistory?.plans) return { usage_count: 0, avg_rating: 0 };

    let usage_count = 0;
    let total_rating = 0;
    let rating_count = 0;

    userHistory.plans.forEach((plan) => {
      [
        ...(plan.saturday_activities || []),
        ...(plan.sunday_activities || []),
      ].forEach((item) => {
        if (item.activity === activityId || item.activity?._id === activityId) {
          usage_count++;
          if (item.rating) {
            total_rating += item.rating;
            rating_count++;
          }
        }
      });
    });

    return {
      usage_count,
      avg_rating: rating_count > 0 ? total_rating / rating_count : 0,
    };
  };

  const handleCreateActivity = async (formData) => {
    try {
      const newActivity = await activityAPI.create(formData);
      onActivityUpdate?.("create", newActivity);
      setShowActivityForm(false);
    } catch (error) {
      console.error("Error creating activity:", error);
      alert(`Failed to create activity: ${error.message}`);
    }
  };

  const handleEditActivity = async (formData) => {
    try {
      const updatedActivity = await activityAPI.update(
        editingActivity._id,
        formData
      );
      onActivityUpdate?.("update", updatedActivity);
      setShowActivityForm(false);
      setEditingActivity(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating activity:", error);
      alert(`Failed to update activity: ${error.message}`);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!confirm("Are you sure you want to delete this activity?")) {
      return;
    }

    try {
      await activityAPI.delete(activityId);
      onActivityUpdate?.("delete", { _id: activityId });
    } catch (error) {
      console.error("Error deleting activity:", error);
      alert(`Failed to delete activity: ${error.message}`);
    }
  };

  const handleEditClick = (activity) => {
    setEditingActivity(activity);
    setIsEditing(true);
    setShowActivityForm(true);
  };

  const handleCreateClick = () => {
    setEditingActivity(null);
    setIsEditing(false);
    setShowActivityForm(true);
  };

  const handleFormClose = () => {
    setShowActivityForm(false);
    setEditingActivity(null);
    setIsEditing(false);
  };

  const filteredAndSortedActivities = useMemo(() => {
    let filtered = activities.filter((activity) => {
      const matchesSearch =
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || activity.category === selectedCategory;
      const matchesTheme =
        !selectedTheme ||
        activity.category.toLowerCase().includes(selectedTheme.toLowerCase());

      return matchesSearch && matchesCategory && matchesTheme;
    });

    // Sort activities
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "duration":
          return a.durationMin - b.durationMin;
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return a.title.localeCompare(b.title);
      }
    });

    return filtered;
  }, [activities, searchTerm, selectedCategory, selectedTheme, sortBy]);

  return (
    <div className="bg-zen-white rounded-b-2xl shadow-xl border border-zen-light-gray border-t-0 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zen-black">Activities</h2>
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <>
              {/* <button
                onClick={() => setShowActivityHistory(!showActivityHistory)}
                className="btn btn-secondary flex items-center gap-2"
              >
                📊 {showActivityHistory ? "Hide" : "Show"} Stats
              </button> */}
              <button
                onClick={handleCreateClick}
                className="btn btn-accent flex items-center gap-2"
              >
                <svg
                  className="w-2 h-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Activity
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 bg-zen-light-gray border border-zen-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-zen-lime focus:border-zen-lime"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-zen-light-gray border border-zen-light-gray rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zen-lime"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-zen-light-gray border border-zen-light-gray rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zen-lime"
          >
            <option value="title">Sort by Name</option>
            <option value="duration">Sort by Duration</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>
      </div>

      {/* Activities Grid */}
      <Droppable droppableId="activities">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto transition-colors duration-200 ${
              snapshot.isDraggingOver ? "bg-blue-50 rounded-lg p-2" : ""
            }`}
          >
            {filteredAndSortedActivities.map((activity, index) => (
              <Draggable
                key={`activity-${activity._id}-${index}`}
                draggableId={`activity-${activity._id}-${index}`}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`${
                      snapshot.isDragging ? "rotate-2 scale-105" : ""
                    }`}
                  >
                    <ActivityCard
                      activity={activity}
                      onAdd={onAdd}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteActivity}
                      isAuthenticated={isAuthenticated}
                      showTimeSelector={enableTimeSelector}
                      existingPlan={existingPlan}
                      index={index}
                      isDragging={snapshot.isDragging}
                      activityStats={getActivityStats(activity._id)}
                      showStats={showActivityHistory}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {filteredAndSortedActivities.length === 0 && (
        <div className="text-center py-8 text-zen-black">
          <div className="text-4xl mb-2">🔍</div>
          <p>No activities found matching your criteria</p>
        </div>
      )}

      {/* Activity Form Modal */}
      <ActivityForm
        isOpen={showActivityForm}
        onClose={handleFormClose}
        onSubmit={isEditing ? handleEditActivity : handleCreateActivity}
        activity={editingActivity}
        isEditing={isEditing}
      />
    </div>
  );
}
