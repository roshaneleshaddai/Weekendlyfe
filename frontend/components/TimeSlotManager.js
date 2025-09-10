"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { formatDate } from "../lib/dateUtils";

const TimeSlotManager = ({
  planItems,
  onTimeChange,
  onAddItem,
  selectedDay,
  selectedTime,
  onDayChange,
  onStartTimeChange,
  onEndTimeChange,
  startTime,
  endTime,
  activityDuration,
  selectedDate,
  weekendPlan,
}) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [conflicts, setConflicts] = useState([]);

  // Generate time slots from 6 AM to 11 PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push({
          time: timeStr,
          hour,
          minute,
          isOccupied: false,
          activity: null,
          isConflicting: false,
        });
      }
    }
    return slots;
  };

  useEffect(() => {
    const slots = generateTimeSlots();
    const occupiedSlots = new Set();
    const newConflicts = [];

    // Mark occupied slots for the selected day
    const dayItems = planItems.filter((item) => item.day === selectedDay);
    dayItems.forEach((item) => {
      if (item.startTime && item.endTime) {
        const startMinutes = timeToMinutes(item.startTime);
        const endMinutes = timeToMinutes(item.endTime);

        slots.forEach((slot) => {
          const slotMinutes = timeToMinutes(slot.time);
          if (slotMinutes >= startMinutes && slotMinutes < endMinutes) {
            slot.isOccupied = true;
            slot.activity = item;
            occupiedSlots.add(slot.time);
          }
        });
      }
    });

    // Check for conflicts with the new activity if we have start time and duration
    if (startTime && activityDuration) {
      const newStartMinutes = timeToMinutes(startTime);
      const newEndMinutes = newStartMinutes + activityDuration;

      slots.forEach((slot) => {
        const slotMinutes = timeToMinutes(slot.time);
        if (slotMinutes >= newStartMinutes && slotMinutes < newEndMinutes) {
          if (slot.isOccupied) {
            slot.isConflicting = true;
            newConflicts.push({
              time: slot.time,
              activity: slot.activity?.activity?.title || "Unknown",
              conflict: true,
            });
          }
        }
      });
    }

    setTimeSlots(slots);
    setConflicts(newConflicts);
  }, [planItems, selectedDay, startTime, activityDuration]);

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

  const getSlotStatus = (slot) => {
    if (slot.isOccupied) {
      return {
        bg: "bg-zen-light-gray border-zen-black",
        text: "text-zen-black",
        cursor: "cursor-not-allowed",
      };
    }
    if (slot.isConflicting) {
      return {
        bg: "bg-zen-light-gray border-zen-black",
        text: "text-zen-black",
        cursor: "cursor-not-allowed",
      };
    }
    if (selectedTime === slot.time) {
      return {
        bg: "bg-zen-lime border-zen-black",
        text: "text-zen-black",
        cursor: "cursor-pointer",
      };
    }
    return {
      bg: "bg-zen-white hover:bg-zen-light-gray",
      text: "text-zen-black",
      cursor: "cursor-pointer",
    };
  };

  const handleSlotClick = (slot) => {
    if (slot.isOccupied || slot.isConflicting) return;
    onTimeChange(slot.time);
  };

  return (
    <div className="bg-zen-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-zen-black">
            Time Slots -{" "}
            {selectedDay?.charAt(0).toUpperCase() + selectedDay?.slice(1)}
          </h3>
          {selectedDate && (
            <p className="text-sm text-zen-black">{formatDate(selectedDate)}</p>
          )}
        </div>
        {onDayChange && (
          <select
            value={selectedDay || ""}
            onChange={(e) => onDayChange(e.target.value)}
            className="px-3 py-1 border border-zen-light-gray rounded text-sm focus:outline-none focus:ring-2 focus:ring-zen-lime"
          >
            <option value="saturday">Saturday</option>
            <option value="sunday">Sunday</option>
          </select>
        )}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 max-h-96 overflow-y-auto">
        {timeSlots.map((slot) => {
          const status = getSlotStatus(slot);
          return (
            <motion.button
              key={slot.time}
              whileHover={{
                scale: slot.isOccupied || slot.isConflicting ? 1 : 1.05,
              }}
              whileTap={{
                scale: slot.isOccupied || slot.isConflicting ? 1 : 0.95,
              }}
              onClick={() => handleSlotClick(slot)}
              className={`
                btn btn-icon text-xs
                ${
                  slot.isOccupied || slot.isConflicting
                    ? "btn-disabled"
                    : "btn-outline"
                }
                ${selectedTime === slot.time ? "btn-accent" : ""}
              `}
              disabled={slot.isOccupied || slot.isConflicting}
            >
              <div className="text-center">
                <div className="font-medium">{slot.time}</div>
                {slot.isOccupied && (
                  <div className="text-xs text-red-500 truncate">
                    {slot.activity?.activity?.title || "Occupied"}
                  </div>
                )}
                {slot.isConflicting && (
                  <div className="text-xs text-orange-500 truncate">
                    Conflict
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {conflicts.length > 0 && (
        <div className="mt-4 p-3 bg-zen-light-gray border border-zen-black rounded-lg">
          <h4 className="text-sm font-medium text-zen-black mb-2">
            Time Conflicts Detected:
          </h4>
          {conflicts.map((conflict, index) => (
            <div key={index} className="text-xs text-zen-black">
              {conflict.activity} at {conflict.time}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeSlotManager;
