"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../lib/AuthContext";
import { useRouter } from "next/navigation";
import { authAPI } from "../../lib/apiService";

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    location: "",

    // Preferences
    preferred_activities: [],
    budget_range: "",
    companions: [],
    preferred_vibe: [],
    dietary_preferences: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const toggleArrayOption = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate basic info
      if (!formData.name.trim()) {
        setError("Name is required");
        return;
      }
      if (!formData.email.trim()) {
        setError("Email is required");
        return;
      }
      if (!formData.password) {
        setError("Password is required");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }
    }
    setError("");
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const data = await authAPI.signup(formData);
      login(data.token, data.user);
      router.push("/");
    } catch (error) {
      setError(error.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-zen-black mb-2"
        >
          Full Name *
        </label>
        <input
          id="name"
          type="text"
          required
          className="w-full px-4 py-3 border border-zen-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-zen-lime"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-zen-black mb-2"
        >
          Email Address *
        </label>
        <input
          id="email"
          type="email"
          required
          className="w-full px-4 py-3 border border-zen-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-zen-lime"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          placeholder="Enter your email"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-zen-black mb-2"
          >
            Password *
          </label>
          <input
            id="password"
            type="password"
            required
            className="w-full px-4 py-3 border border-zen-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-zen-lime"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            placeholder="Create password"
          />
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-zen-black mb-2"
          >
            Confirm Password *
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            className="w-full px-4 py-3 border border-zen-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-zen-lime"
            value={formData.confirmPassword}
            onChange={(e) =>
              handleInputChange("confirmPassword", e.target.value)
            }
            placeholder="Confirm password"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-zen-black mb-2"
        >
          Phone Number (Optional)
        </label>
        <input
          id="phone"
          type="tel"
          className="w-full px-4 py-3 border border-zen-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-zen-lime"
          value={formData.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          placeholder="Enter your phone number"
        />
      </div>

      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-zen-black mb-2"
        >
          Location
        </label>
        <input
          id="location"
          type="text"
          className="w-full px-4 py-3 border border-zen-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-zen-lime"
          value={formData.location}
          onChange={(e) => handleInputChange("location", e.target.value)}
          placeholder="Enter your city"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-zen-black mb-3">
          What activities do you enjoy? (Select multiple)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {activityOptions.map((activity) => (
            <button
              key={activity}
              type="button"
              onClick={() =>
                toggleArrayOption("preferred_activities", activity)
              }
              className={`p-2 text-sm rounded-lg border-2 transition-all ${
                formData.preferred_activities.includes(activity)
                  ? "border-zen-lime bg-zen-lime text-zen-black"
                  : "border-zen-light-gray hover:border-zen-black"
              }`}
            >
              {activity}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zen-black mb-3">
          What's your budget range?
        </label>
        <div className="space-y-2">
          {budgetOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleInputChange("budget_range", option.value)}
              className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                formData.budget_range === option.value
                  ? "border-zen-lime bg-zen-lime text-zen-black"
                  : "border-zen-light-gray hover:border-zen-black"
              }`}
            >
              <span className="mr-2">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-zen-black mb-3">
          Who do you usually spend weekends with? (Select multiple)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {companionOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleArrayOption("companions", option.value)}
              className={`p-3 text-left rounded-lg border-2 transition-all ${
                formData.companions.includes(option.value)
                  ? "border-zen-lime bg-zen-lime text-zen-black"
                  : "border-zen-light-gray hover:border-zen-black"
              }`}
            >
              <span className="mr-2">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zen-black mb-3">
          What vibes do you prefer? (Select multiple)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {vibeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleArrayOption("preferred_vibe", option.value)}
              className={`p-2 text-sm rounded-lg border-2 transition-all ${
                formData.preferred_vibe.includes(option.value)
                  ? "border-zen-lime bg-zen-lime text-zen-black"
                  : "border-zen-light-gray hover:border-zen-black"
              }`}
            >
              <span className="mr-1">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zen-black mb-3">
          Dietary Preferences (Select multiple)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {dietaryOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                toggleArrayOption("dietary_preferences", option.value)
              }
              className={`p-2 text-left rounded-lg border-2 transition-all ${
                formData.dietary_preferences.includes(option.value)
                  ? "border-zen-lime bg-zen-lime text-zen-black"
                  : "border-zen-light-gray hover:border-zen-black"
              }`}
            >
              <span className="mr-2">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-8"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-zen-lime rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-zen-black font-bold text-2xl">W</span>
          </div>
          <h2 className="text-3xl font-bold text-zen-black">
            {currentStep === 1 && "Create your account"}
            {currentStep === 2 && "Tell us about your interests"}
            {currentStep === 3 && "Final preferences"}
          </h2>
          <p className="mt-2 text-sm text-zen-black">
            {currentStep === 1 && "Let's start with your basic information"}
            {currentStep === 2 && "Help us personalize your experience"}
            {currentStep === 3 && "Almost done! Just a few more details"}
          </p>

          {/* Progress indicator */}
          <div className="mt-4 flex justify-center space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full ${
                  step <= currentStep ? "bg-zen-lime" : "bg-zen-light-gray"
                }`}
              />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zen-white rounded-2xl shadow-xl border border-zen-light-gray p-8"
        >
          <form
            onSubmit={currentStep === 3 ? submit : (e) => e.preventDefault()}
            className="space-y-6"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zen-light-gray border border-zen-black text-zen-black px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Step Content */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </motion.div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn btn-outline flex-1"
                >
                  Previous
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn btn-primary flex-1"
                >
                  Next
                </button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className={
                    isLoading
                      ? "btn btn-disabled flex-1"
                      : "btn btn-primary flex-1"
                  }
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-zen-white mr-2"></div>
                      Creating account...
                    </div>
                  ) : (
                    "Create account"
                  )}
                </motion.button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-zen-black">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-medium text-zen-lime hover:text-zen-black transition-colors"
              >
                Sign in here
              </a>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
