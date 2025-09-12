"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../lib/AuthContext";
import { authAPI, planAPI } from "../../lib/apiService";
import { formatDate, formatDateShort } from "../../lib/dateUtils";

export default function ProfilePage() {
  const { auth, isAuthenticated } = useAuth();
  const token = auth?.token;

  // Profile form state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    preferred_activities: [],
    budget_range: "medium",
    companions: [],
    preferred_vibe: [],
    dietary_preferences: [],
    bio: "",
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
  });

  // History state
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const saturday = new Date(now);
    saturday.setDate(now.getDate() + (6 - now.getDay()));
    return saturday.toISOString().split("T")[0];
  });

  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user profile
  const { data: userProfile, mutate: mutateProfile } = useSWR(
    token ? "user-profile" : null,
    () => authAPI.getProfile()
  );

  // Fetch user history
  const { data: userHistory } = useSWR(
    token && showHistory ? `user-history-${selectedDate}` : null,
    () => planAPI.getHistory(selectedDate)
  );

  // Load profile data into form when received
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        location: userProfile.location || "",
        preferred_activities: userProfile.preferred_activities || [],
        budget_range: userProfile.budget_range || "medium",
        companions: userProfile.companions || [],
        preferred_vibe: userProfile.preferred_vibe || [],
        dietary_preferences: userProfile.dietary_preferences || [],
        bio: userProfile.bio || "",
        notifications: userProfile.notifications || {
          email: true,
          sms: false,
          push: true,
        },
      });
    }
  }, [userProfile]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleNotificationChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value,
      },
    }));
  };

  const handleSaveProfile = async () => {
    if (!isAuthenticated) {
      showNotification("Please login to update your profile", "error");
      return;
    }

    setIsLoading(true);
    try {
      const { email, ...updateData } = formData; // Don't update email
      await authAPI.updateProfile(updateData);
      mutateProfile();
      setIsEditing(false);
      showNotification("Profile updated successfully!", "success");
    } catch (error) {
      showNotification(error.message || "Failed to update profile", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        location: userProfile.location || "",
        preferred_activities: userProfile.preferred_activities || [],
        budget_range: userProfile.budget_range || "medium",
        companions: userProfile.companions || [],
        preferred_vibe: userProfile.preferred_vibe || [],
        dietary_preferences: userProfile.dietary_preferences || [],
        bio: userProfile.bio || "",
        notifications: userProfile.notifications || {
          email: true,
          sms: false,
          push: true,
        },
      });
    }
    setIsEditing(false);
  };

  // Form options
  const activityOptions = [
    "Hiking",
    "Movies",
    "Brunch",
    "Museums",
    "Parks",
    "Shopping",
    "Concerts",
    "Sports",
    "Gaming",
    "Reading",
    "Cooking",
    "Dancing",
    "Photography",
    "Art Galleries",
    "Beach",
    "Cafes",
    "Nightlife",
  ];

  const budgetOptions = [
    { value: "low", label: "Budget-friendly (₹0-500)", icon: "💰" },
    { value: "medium", label: "Moderate (₹500-2000)", icon: "💳" },
    { value: "premium", label: "Premium (₹2000+)", icon: "💎" },
  ];

  const companionOptions = [
    { value: "solo", label: "Solo Adventures", icon: "🧘‍♀️" },
    { value: "family", label: "Family Time", icon: "👨‍👩‍👧‍👦" },
    { value: "friends", label: "Friends Hangout", icon: "👥" },
    { value: "couple", label: "Date Nights", icon: "💕" },
  ];

  const vibeOptions = [
    { value: "adventurous", label: "Adventurous", icon: "🏔️" },
    { value: "relaxing", label: "Relaxing", icon: "🧘‍♂️" },
    { value: "energetic", label: "Energetic", icon: "⚡" },
    { value: "cultural", label: "Cultural", icon: "🎭" },
    { value: "party", label: "Party", icon: "🎉" },
    { value: "romantic", label: "Romantic", icon: "💖" },
  ];

  const dietaryOptions = [
    { value: "vegetarian", label: "Vegetarian", icon: "🥗" },
    { value: "non-vegetarian", label: "Non-Vegetarian", icon: "🍖" },
    { value: "vegan", label: "Vegan", icon: "🌱" },
    { value: "jain", label: "Jain", icon: "🙏" },
    { value: "no-preference", label: "No Preference", icon: "🍽️" },
  ];

  // History Component
  const HistoryPanel = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-zen-white rounded-2xl shadow-xl border border-zen-light-gray p-6 mt-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-zen-black">
          Weekend History for {formatDate(selectedDate)}
        </h3>
        <button
          onClick={() => setShowHistory(false)}
          className="btn btn-icon btn-secondary"
        >
          ✕
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-zen-black mb-2">
          Select Date to View History
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border border-zen-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-zen-lime"
        />
      </div>

      {userHistory ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-zen-light-gray rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-zen-black">
                {userHistory.stats?.total_plans || 0}
              </div>
              <div className="text-sm text-zen-black">Plans for this date</div>
            </div>
            <div className="bg-zen-lime rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-zen-black">
                {userHistory.stats?.completed_plans || 0}
              </div>
              <div className="text-sm text-zen-black">Completed</div>
            </div>
            <div className="bg-zen-white border border-zen-light-gray rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-zen-black">
                {userHistory.stats?.average_rating?.toFixed(1) || "N/A"}
              </div>
              <div className="text-sm text-zen-black">Avg Rating</div>
            </div>
          </div>

          {userHistory.plans && userHistory.plans.length > 0 ? (
            <div className="max-h-96 overflow-y-auto space-y-3">
              {userHistory.plans.map((plan) => (
                <div
                  key={plan._id}
                  className="border border-zen-light-gray rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-zen-black">
                      {formatDate(plan.weekend_date)}
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs ${
                        plan.status === "completed"
                          ? "bg-zen-lime text-zen-black"
                          : plan.status === "in_progress"
                          ? "bg-zen-black text-zen-white"
                          : "bg-zen-light-gray text-zen-black"
                      }`}
                    >
                      {plan.status}
                    </div>
                  </div>
                  <div className="text-sm text-zen-black">
                    {plan.saturday_activities?.length || 0} Saturday +{" "}
                    {plan.sunday_activities?.length || 0} Sunday activities
                  </div>
                  {plan.overall_rating && (
                    <div className="text-sm text-zen-black mt-1">
                      Rating: {"⭐".repeat(plan.overall_rating)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-zen-black">
              <div className="text-4xl mb-2">📅</div>
              <p>No plans found for {formatDate(selectedDate)}</p>
              <p className="text-sm opacity-70 mt-2">
                Try selecting a different date or create a new plan
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-zen-black">
          <div className="text-4xl mb-2">📅</div>
          <p>Loading your weekend history...</p>
        </div>
      )}
    </motion.div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zen-light-gray">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-zen-black mb-2">
            Please Login
          </h2>
          <p className="text-zen-black">
            You need to be logged in to access your profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zen-light-gray">
      {/* Notification */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            notification.type === "success"
              ? "bg-zen-lime text-zen-black"
              : "bg-zen-black text-zen-white"
          }`}
        >
          {notification.message}
        </motion.div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zen-black mb-2">My Profile</h1>
          <p className="text-zen-black opacity-70">
            Manage your account settings and view your weekend history
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-zen-white rounded-2xl shadow-xl border border-zen-light-gray p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-zen-black">
                  Profile Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-primary"
                  >
                    ✏️ Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="btn btn-primary"
                    >
                      {isLoading ? "Saving..." : "💾 Save"}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="btn btn-secondary"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                )}
              </div>

              {userProfile ? (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-zen-black mb-4">
                      Basic Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zen-black mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zen-lime ${
                            isEditing
                              ? "border-zen-light-gray"
                              : "border-zen-light-gray bg-zen-light-gray"
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zen-black mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          className="w-full px-3 py-2 border border-zen-light-gray bg-zen-light-gray rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zen-black mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zen-lime ${
                            isEditing
                              ? "border-zen-light-gray"
                              : "border-zen-light-gray bg-zen-light-gray"
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zen-black mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) =>
                            handleInputChange("location", e.target.value)
                          }
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zen-lime ${
                            isEditing
                              ? "border-zen-light-gray"
                              : "border-zen-light-gray bg-zen-light-gray"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-zen-black mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zen-lime ${
                        isEditing
                          ? "border-zen-light-gray"
                          : "border-zen-light-gray bg-zen-light-gray"
                      }`}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  {/* Preferences */}
                  <div>
                    <h3 className="text-lg font-semibold text-zen-black mb-4">
                      Preferences
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-zen-black mb-2">
                          Budget Range
                        </label>
                        <div className="space-y-2">
                          {budgetOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                isEditing &&
                                handleInputChange("budget_range", option.value)
                              }
                              className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                                formData.budget_range === option.value
                                  ? "border-zen-lime bg-zen-lime text-zen-black"
                                  : "border-zen-light-gray hover:border-zen-black"
                              } ${
                                !isEditing
                                  ? "opacity-60 cursor-not-allowed"
                                  : ""
                              }`}
                              disabled={!isEditing}
                            >
                              <span className="mr-2">{option.icon}</span>
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zen-black mb-2">
                          Preferred Activities (Select multiple)
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {activityOptions.map((activity) => (
                            <button
                              key={activity}
                              type="button"
                              onClick={() =>
                                isEditing &&
                                handleArrayInputChange(
                                  "preferred_activities",
                                  activity
                                )
                              }
                              className={`p-2 text-sm rounded-lg border-2 transition-all ${
                                formData.preferred_activities.includes(activity)
                                  ? "border-zen-lime bg-zen-lime text-zen-black"
                                  : "border-zen-light-gray hover:border-zen-black"
                              } ${
                                !isEditing
                                  ? "opacity-60 cursor-not-allowed"
                                  : ""
                              }`}
                              disabled={!isEditing}
                            >
                              {activity}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zen-black mb-2">
                          Companions (Select multiple)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {companionOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                isEditing &&
                                handleArrayInputChange(
                                  "companions",
                                  option.value
                                )
                              }
                              className={`p-3 text-left rounded-lg border-2 transition-all ${
                                formData.companions.includes(option.value)
                                  ? "border-zen-lime bg-zen-lime text-zen-black"
                                  : "border-zen-light-gray hover:border-zen-black"
                              } ${
                                !isEditing
                                  ? "opacity-60 cursor-not-allowed"
                                  : ""
                              }`}
                              disabled={!isEditing}
                            >
                              <span className="mr-2">{option.icon}</span>
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zen-black mb-2">
                          Preferred Vibes (Select multiple)
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {vibeOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                isEditing &&
                                handleArrayInputChange(
                                  "preferred_vibe",
                                  option.value
                                )
                              }
                              className={`p-2 text-sm rounded-lg border-2 transition-all ${
                                formData.preferred_vibe.includes(option.value)
                                  ? "border-zen-lime bg-zen-lime text-zen-black"
                                  : "border-zen-light-gray hover:border-zen-black"
                              } ${
                                !isEditing
                                  ? "opacity-60 cursor-not-allowed"
                                  : ""
                              }`}
                              disabled={!isEditing}
                            >
                              <span className="mr-1">{option.icon}</span>
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zen-black mb-2">
                          Dietary Preferences (Select multiple)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {dietaryOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                isEditing &&
                                handleArrayInputChange(
                                  "dietary_preferences",
                                  option.value
                                )
                              }
                              className={`p-2 text-left rounded-lg border-2 transition-all ${
                                formData.dietary_preferences.includes(
                                  option.value
                                )
                                  ? "border-zen-lime bg-zen-lime text-zen-black"
                                  : "border-zen-light-gray hover:border-zen-black"
                              } ${
                                !isEditing
                                  ? "opacity-60 cursor-not-allowed"
                                  : ""
                              }`}
                              disabled={!isEditing}
                            >
                              <span className="mr-2">{option.icon}</span>
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div>
                    <h3 className="text-lg font-semibold text-zen-black mb-4">
                      Notification Settings
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.notifications.email}
                          onChange={(e) =>
                            handleNotificationChange("email", e.target.checked)
                          }
                          disabled={!isEditing}
                          className="mr-3"
                        />
                        <span className="text-zen-black">
                          Email Notifications
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.notifications.sms}
                          onChange={(e) =>
                            handleNotificationChange("sms", e.target.checked)
                          }
                          disabled={!isEditing}
                          className="mr-3"
                        />
                        <span className="text-zen-black">
                          SMS Notifications
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.notifications.push}
                          onChange={(e) =>
                            handleNotificationChange("push", e.target.checked)
                          }
                          disabled={!isEditing}
                          className="mr-3"
                        />
                        <span className="text-zen-black">
                          Push Notifications
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zen-lime mx-auto mb-4"></div>
                  <p className="text-zen-black">Loading profile...</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-zen-white rounded-2xl shadow-xl border border-zen-light-gray p-6">
              <h3 className="text-xl font-bold text-zen-black mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full btn btn-secondary text-left"
                >
                  📊 {showHistory ? "Hide" : "View"} History
                </button>
                <a
                  href="/"
                  className="w-full btn btn-primary text-left block text-center"
                >
                  🏠 Back to Weekend Planner
                </a>
              </div>

              {userProfile && (
                <div className="mt-6 pt-6 border-t border-zen-light-gray">
                  <h4 className="font-semibold text-zen-black mb-3">
                    Account Info
                  </h4>
                  <div className="text-sm text-zen-black space-y-2">
                    <div>
                      <strong>Member since:</strong>{" "}
                      {formatDateShort(userProfile.createdAt)}
                    </div>
                    <div>
                      <strong>Last login:</strong>{" "}
                      {userProfile.lastLogin
                        ? formatDateShort(userProfile.lastLogin)
                        : "N/A"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Panel */}
        <AnimatePresence>{showHistory && <HistoryPanel />}</AnimatePresence>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-zen-black/50 flex items-center justify-center z-50">
            <div className="bg-zen-white rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zen-lime"></div>
              <span className="text-zen-black">Updating profile...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
