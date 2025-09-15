"use client";
import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { motion, AnimatePresence } from "framer-motion";
import TimeSlotManager from "./TimeSlotManager";
import { useAuth } from "../lib/AuthContext";
import { formatDate } from "../lib/dateUtils";
import { planAPI } from "../lib/apiService";

const PlanItemCard = ({
  item,
  onRemove,
  onTimeChange,
  onVibeChange,
  onNotesChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(item.notes || "");

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    onTimeChange(item, newTime);
  };

  const handleNotesChange = (e) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    onNotesChange(item, newNotes);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-zen-white rounded-xl shadow-sm border border-zen-light-gray overflow-hidden hover:shadow-md transition-all duration-200"
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{item.activity?.icon}</span>
            <div>
              <h4 className="font-semibold text-zen-black">
                {item.activity?.title}
              </h4>
              <p className="text-sm text-zen-black">
                {item.activity?.category}
                {item.activity?.source &&
                  item.activity.source !== "internal" && (
                    <span className="ml-2 text-xs bg-zen-lime text-zen-black px-1 py-0.5 rounded">
                      {item.activity.source === "tmdb" ? "Movie" : "Place"}
                    </span>
                  )}
              </p>
            </div>
          </div>
          <button
            onClick={() => onRemove(item)}
            className="btn btn-icon btn-danger"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {/* Time Selection */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-zen-black">Time:</label>
            <input
              type="time"
              value={item.startTime || "09:00"}
              onChange={handleTimeChange}
              className="px-2 py-1 border border-zen-light-gray rounded text-sm focus:outline-none focus:ring-2 focus:ring-zen-lime"
            />
            <span className="text-sm text-zen-black">
              - {item.endTime || "10:00"}
            </span>
            <span className="text-xs bg-zen-light-gray text-zen-black px-2 py-1 rounded">
              {item.activity?.durationMin || 60}m
            </span>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-zen-black block mb-1">
              Notes:
            </label>
            <textarea
              value={notes}
              onChange={handleNotesChange}
              placeholder="Add notes about this activity..."
              className="w-full px-3 py-2 border border-zen-light-gray rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zen-lime resize-none"
              rows="1"
            />
          </div>
        </div>

        {/* Activity Color Indicator */}
        <div className="mt-3 flex items-center justify-between">
          <div
            className="w-6 h-6 rounded-full border-2"
            style={{
              backgroundColor: item.activity?.color || "#FDE68A",
            }}
          ></div>
          <div className="text-xs text-zen-black">
            {item.activity?.description}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DayColumn = ({
  dayKey,
  items,
  onRemove,
  onTimeChange,
  onVibeChange,
  onNotesChange,
  onDragEnd,
  checkTimeConflict,
}) => {
  const [dragOverConflict, setDragOverConflict] = useState(null);

  const handleDragOver = (provided, snapshot) => {
    // Check for conflicts when dragging over this column
    if (snapshot.isDraggingOver && snapshot.draggingFromThisWith) {
      // This is a drag from within the same column (reordering)
      return;
    }

    if (snapshot.isDraggingOver && snapshot.draggingFromThisWith === null) {
      // This is a drag from outside (like from activities panel)
      // We can't check conflicts here because we don't have the activity data
      // The conflict check will happen in onDragEnd
    }
  };

  return (
    <div className="bg-zen-white rounded-2xl shadow-xl border border-zen-light-gray p-6 h-[500px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-zen-black capitalize flex items-center space-x-2">
          <span className="text-2xl">
            {dayKey === "saturday" ? "🗓️" : "📅"}
          </span>
          <span>{dayKey}</span>
        </h3>
        <div className="text-sm text-zen-black">{items.length} activities</div>
      </div>

      <Droppable droppableId={dayKey}>
        {(provided, snapshot) => {
          handleDragOver(provided, snapshot);

          return (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`space-y-4 min-h-[300px] transition-colors flex-1 overflow-y-auto duration-200 ${
                snapshot.isDraggingOver
                  ? dragOverConflict
                    ? "bg-red-100 border-2 border-red-300 rounded-lg"
                    : "bg-zen-lime rounded-lg"
                  : ""
              }`}
              style={{ maxHeight: "340px" }}
            >
              <AnimatePresence>
                {items.map((item, index) => (
                  <Draggable
                    key={`${dayKey}-${
                      item._id ||
                      item.activity?._id ||
                      item.external_activity?.id ||
                      index
                    }-${index}`}
                    draggableId={`${dayKey}-${
                      item._id ||
                      item.activity?._id ||
                      item.external_activity?.id ||
                      index
                    }-${index}`}
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
                        <PlanItemCard
                          item={item}
                          onRemove={onRemove}
                          onTimeChange={onTimeChange}
                          onVibeChange={onVibeChange}
                          onNotesChange={onNotesChange}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
              </AnimatePresence>
              {provided.placeholder}

              {items.length === 0 && (
                <div className="text-center py-12 text-zen-black">
                  <div className="text-4xl mb-2">📝</div>
                  <p>No activities planned for {dayKey}</p>
                  <p className="text-sm">
                    Drag activities here to plan your day
                  </p>
                </div>
              )}
            </div>
          );
        }}
      </Droppable>
    </div>
  );
};

export default function ScheduleBoard({
  plan,
  setPlan,
  onSave,
  themes,
  selectedTheme,
  onThemeChange,
  onDragEnd,
  selectedDate,
  weekendPlan,
  onDateChange,
  onPlanLoad,
  checkTimeConflict,
}) {
  const { isAuthenticated } = useAuth();
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [selectedDay, setSelectedDay] = useState("saturday");
  const [selectedTime, setSelectedTime] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [localSelectedDate, setLocalSelectedDate] = useState(selectedDate);

  // Check if the selected date is in the past
  const isPastDate = (date) => {
    const today = new Date();
    const selected = new Date(date);
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);
    return selected < today;
  };

  // Handle date change
  const handleDateChange = async (newDate) => {
    setLocalSelectedDate(newDate);
    if (onDateChange) {
      onDateChange(newDate);
    }

    // Load plan for the new date
    if (onPlanLoad) {
      setIsLoadingPlan(true);
      try {
        await onPlanLoad(newDate);
      } catch (error) {
        console.error("Error loading plan:", error);
      } finally {
        setIsLoadingPlan(false);
      }
    }
  };

  // Auto-complete past dates
  useEffect(() => {
    if (
      weekendPlan &&
      isPastDate(localSelectedDate) &&
      weekendPlan.status !== "completed"
    ) {
      handleStatusChange("completed");
    }
  }, [localSelectedDate, weekendPlan]);

  // Add new activity to the plan
  const addActivity = (activity, day, startTime = "09:00") => {
    const newItem = {
      _id: `temp_${Date.now()}`,
      activity: activity,
      day: day,
      startTime: startTime,
      endTime: calculateEndTime(startTime, activity.durationMin),
      vibe: "relaxed",
      notes: "",
    };

    setPlan((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), newItem],
    }));
  };

  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime, durationMin) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationMin;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMinutes
      .toString()
      .padStart(2, "0")}`;
  };

  const removeItem = (item) => {
    setPlan((prev) => ({
      ...prev,
      [item.day]: prev[item.day].filter((x) => x !== item),
    }));
  };

  const handleTimeChange = (item, newTime) => {
    setPlan((prev) => ({
      ...prev,
      [item.day]: prev[item.day].map((p) =>
        p === item ? { ...p, startTime: newTime } : p
      ),
    }));
  };

  const handleVibeChange = (item, newVibe) => {
    setPlan((prev) => ({
      ...prev,
      [item.day]: prev[item.day].map((p) =>
        p === item ? { ...p, vibe: newVibe } : p
      ),
    }));
  };

  const handleNotesChange = (item, newNotes) => {
    setPlan((prev) => ({
      ...prev,
      [item.day]: prev[item.day].map((p) =>
        p === item ? { ...p, notes: newNotes } : p
      ),
    }));
  };

  const calculateTotalDuration = (day) => {
    return (plan[day] || []).reduce(
      (total, item) =>
        total +
        (item.activity?.durationMin ||
          item.external_activity?.durationMin ||
          0),
      0
    );
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleStatusChange = async (newStatus) => {
    if (!weekendPlan || !isAuthenticated) return;

    setIsUpdatingStatus(true);
    try {
      await planAPI.updateStatus(weekendPlan._id, newStatus);
      // Trigger a refresh of the current plan
      window.location.reload(); // Simple approach - in production you'd use SWR mutate
    } catch (error) {
      console.error("Error updating status:", error);
      alert(`Failed to update status: ${error.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-zen-lime text-zen-black";
      case "in_progress":
        return "bg-zen-black text-zen-white";
      case "planning":
      default:
        return "bg-zen-light-gray text-zen-black";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Theme Selection and Actions */}
      <div className="bg-zen-white rounded-2xl shadow-xl border border-zen-light-gray p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-3xl font-bold text-zen-black mb-2">
              Your Weekend Plan
            </h2>
            <p className="text-zen-black">
              {localSelectedDate
                ? `Plan for ${formatDate(localSelectedDate)} Weekend`
                : "Plan your perfect weekend with activities and themes"}
            </p>

            {/* Date Selection */}
            <div className="mt-3 flex items-center space-x-3">
              <label className="text-sm font-medium text-zen-black">
                Select Date:
              </label>
              <input
                type="date"
                value={localSelectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                disabled={isLoadingPlan}
                className="px-3 py-2 border border-zen-light-gray rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zen-lime disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {isLoadingPlan && (
                <div className="flex items-center space-x-2 text-sm text-zen-black">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-zen-lime"></div>
                  <span>Loading...</span>
                </div>
              )}
              {isPastDate(localSelectedDate) && (
                <span className="text-xs bg-zen-lime text-zen-black px-2 py-1 rounded">
                  Past Date - Auto-completed
                </span>
              )}
            </div>
            {weekendPlan && (
              <div className="mt-2 flex items-center gap-3">
                {/* <div className="text-sm text-zen-black">
                  Status:{" "}
                  <span
                    className={`px-2 py-1 rounded text-xs ${getStatusColor(
                      weekendPlan.status
                    )}`}
                  >
                    {weekendPlan.status}
                  </span>
                </div> */}
                {isAuthenticated && (
                  <select
                    value={weekendPlan.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isUpdatingStatus}
                    className="text-xs px-2 py-1 border border-zen-light-gray rounded focus:outline-none focus:ring-2 focus:ring-zen-lime disabled:opacity-50"
                  >
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Theme Selector */}
            {/* <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-600">
                Theme:
              </label>
              <select
                value={selectedTheme || ""}
                onChange={(e) => onThemeChange(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a theme</option>
                {themes?.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.icon} {theme.name}
                  </option>
                ))}
              </select>
            </div> */}

            {/* Time Slot Manager Toggle */}
            <button
              onClick={() => setShowTimeSlots(!showTimeSlots)}
              className="btn btn-secondary"
            >
              {showTimeSlots ? "Hide" : "Show"} Time Slots
            </button>

            {/* Save Button */}
            <button
              onClick={onSave}
              disabled={!isAuthenticated}
              className={
                isAuthenticated ? "btn btn-primary" : "btn btn-disabled"
              }
            >
              {isAuthenticated ? "Save Plan" : "Login to Save"}
            </button>
          </div>
        </div>

        {/* Duration Summary */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-zen-light-gray rounded-lg p-3">
            <div className="text-sm text-zen-black font-medium">Saturday</div>
            <div className="text-lg font-bold text-zen-black">
              {formatDuration(calculateTotalDuration("saturday"))}
            </div>
          </div>
          <div className="bg-zen-lime rounded-lg p-3">
            <div className="text-sm text-zen-black font-medium">Sunday</div>
            <div className="text-lg font-bold text-zen-black">
              {formatDuration(calculateTotalDuration("sunday"))}
            </div>
          </div>
        </div>
      </div>

      {/* Time Slot Manager */}
      {showTimeSlots && (
        <TimeSlotManager
          planItems={[...(plan.saturday || []), ...(plan.sunday || [])]}
          onTimeChange={setSelectedTime}
          onAddItem={() => {}}
          selectedDay={selectedDay}
          selectedTime={selectedTime}
          onDayChange={setSelectedDay}
          onStartTimeChange={() => {}}
          onEndTimeChange={() => {}}
          startTime={null}
          endTime={null}
          activityDuration={null}
        />
      )}

      {/* Schedule Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <DayColumn
          dayKey="saturday"
          items={plan.saturday || []}
          onRemove={removeItem}
          onTimeChange={handleTimeChange}
          onVibeChange={handleVibeChange}
          onNotesChange={handleNotesChange}
          onDragEnd={onDragEnd}
          checkTimeConflict={checkTimeConflict}
        />
        <DayColumn
          dayKey="sunday"
          items={plan.sunday || []}
          onRemove={removeItem}
          onTimeChange={handleTimeChange}
          onVibeChange={handleVibeChange}
          onNotesChange={handleNotesChange}
          onDragEnd={onDragEnd}
          checkTimeConflict={checkTimeConflict}
        />
      </div>
    </div>
  );
}
