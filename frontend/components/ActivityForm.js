"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const ActivityForm = ({
  isOpen,
  onClose,
  onSubmit,
  activity = null,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    durationMin: 60,
    color: "#FDE68A",
    icon: "🎯",
    description: "",
    image: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    "Food",
    "Outdoors",
    "Entertainment",
    "Chill",
    "Social",
    "Learning",
    "Fitness",
    "Health",
    "Travel",
    "Hobby",
    "Other",
  ];

  const colorOptions = [
    { name: "Yellow", value: "#FDE68A" },
    { name: "Green", value: "#BBF7D0" },
    { name: "Blue", value: "#C7D2FE" },
    { name: "Pink", value: "#FAD9E8" },
    { name: "Purple", value: "#F3E8FF" },
    { name: "Orange", value: "#FED7AA" },
    { name: "Red", value: "#FECACA" },
    { name: "Indigo", value: "#E0E7FF" },
  ];

  const iconOptions = [
    "🎯",
    "☕",
    "🍽️",
    "👨‍🍳",
    "🥾",
    "🏖️",
    "⛺",
    "🚴",
    "🎬",
    "🎵",
    "🏛️",
    "📚",
    "🧖‍♀️",
    "🧘‍♀️",
    "🎲",
    "🎉",
    "💬",
    "💻",
    "🔧",
    "💪",
    "🧘‍♂️",
    "🏊‍♀️",
    "🎨",
    "🎮",
    "📱",
    "✈️",
    "🏠",
    "🌟",
  ];

  useEffect(() => {
    if (isEditing && activity) {
      setFormData({
        title: activity.title || "",
        category: activity.category || "",
        durationMin: activity.durationMin || 60,
        color: activity.color || "#FDE68A",
        icon: activity.icon || "🎯",
        description: activity.description || "",
        image: activity.image || "",
      });
    } else {
      setFormData({
        title: "",
        category: "",
        durationMin: 60,
        color: "#FDE68A",
        icon: "🎯",
        description: "",
        image: "",
      });
    }
    setErrors({});
  }, [isEditing, activity, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.durationMin || formData.durationMin < 15) {
      newErrors.durationMin = "Duration must be at least 15 minutes";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting activity:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-zen-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-zen-black">
              {isEditing ? "Edit Activity" : "Create New Activity"}
            </h2>
            <button onClick={onClose} className="btn btn-icon btn-danger">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-zen-black mb-2">
                Activity Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zen-lime ${
                  errors.title ? "border-zen-black" : "border-zen-light-gray"
                }`}
                placeholder="Enter activity title"
              />
              {errors.title && (
                <p className="text-zen-black text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Category and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zen-black mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zen-lime ${
                    errors.category
                      ? "border-zen-black"
                      : "border-zen-light-gray"
                  }`}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-zen-black text-sm mt-1">
                    {errors.category}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zen-black mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  min="15"
                  max="480"
                  value={formData.durationMin}
                  onChange={(e) =>
                    handleChange("durationMin", parseInt(e.target.value))
                  }
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zen-lime ${
                    errors.durationMin
                      ? "border-zen-black"
                      : "border-zen-light-gray"
                  }`}
                />
                {errors.durationMin && (
                  <p className="text-zen-black text-sm mt-1">
                    {errors.durationMin}
                  </p>
                )}
              </div>
            </div>

            {/* Icon and Color */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zen-black mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => handleChange("icon", icon)}
                      className={`p-1 text-2xl rounded-lg border-2 transition-all ${
                        formData.icon === icon
                          ? "border-zen-lime bg-zen-light-gray"
                          : "border-zen-light-gray hover:border-zen-black"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zen-black mb-2">
                  Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => handleChange("color", color.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.color === color.value
                          ? "border-zen-lime ring-2 ring-zen-lime"
                          : "border-zen-light-gray hover:border-zen-black"
                      }`}
                      style={{ backgroundColor: color.value }}
                    >
                      <span className="sr-only">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-zen-black mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zen-lime ${
                  errors.description
                    ? "border-zen-black"
                    : "border-zen-light-gray"
                }`}
                placeholder="Describe this activity..."
              />
              {errors.description && (
                <p className="text-zen-black text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-zen-black mb-2">
                Image URL (optional)
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => handleChange("image", e.target.value)}
                className="w-full px-4 py-3 border border-zen-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-zen-lime"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-zen-black mb-2">
                Preview
              </label>
              <div className="p-4 border border-zen-light-gray rounded-lg bg-zen-light-gray">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{formData.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-zen-black">
                      {formData.title || "Activity Title"}
                    </h3>
                    <p className="text-sm text-zen-black">
                      {formData.category || "Category"} •{" "}
                      {formData.durationMin || 60}m
                    </p>
                    <p className="text-sm text-zen-black mt-1">
                      {formData.description ||
                        "Description will appear here..."}
                    </p>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: formData.color }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={
                  isSubmitting
                    ? "btn btn-disabled flex-1"
                    : "btn btn-primary flex-1"
                }
              >
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                  ? "Update Activity"
                  : "Create Activity"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ActivityForm;
