"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext } from "react-beautiful-dnd";
import ActivitiesPanel from "../components/ActivitiesPanel";
import ScheduleBoard from "../components/ScheduleBoard";
import MoviesPanel from "../components/MoviesPanel";
import PlacesPanel from "../components/PlacesPanel";
import { useAuth } from "../lib/AuthContext";
import apiService, { activityAPI, planAPI, themeAPI } from "../lib/apiService";
import { formatDate, formatDateShort, getWeekendDates } from "../lib/dateUtils";

// Typing Text Component
const TypingText = ({ texts, className = "" }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(
      () => {
        const fullText = texts[currentTextIndex];

        if (isPaused) {
          setIsPaused(false);
          return;
        }

        if (isDeleting) {
          setCurrentText(fullText.substring(0, currentText.length - 1));
          if (currentText === "") {
            setIsDeleting(false);
            setCurrentTextIndex((prev) => (prev + 1) % texts.length);
            setIsPaused(true);
          }
        } else {
          setCurrentText(fullText.substring(0, currentText.length + 1));
          if (currentText === fullText) {
            setIsPaused(true);
            setTimeout(() => setIsDeleting(true), 2000);
          }
        }
      },
      isDeleting ? 50 : 100
    );

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, isPaused, currentTextIndex, texts]);

  return (
    <div className={className}>
      <span>{currentText}</span>
      <span className="animate-pulse">|</span>
    </div>
  );
};

export default function Home() {
  const { auth, isAuthenticated } = useAuth();
  const token = auth?.token;

  // Date management
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const saturday = new Date(now);
    saturday.setDate(now.getDate() + (6 - now.getDay())); // Next Saturday
    return saturday.toISOString().split("T")[0];
  });

  // Fetch data using API service
  const { data: activities, error: activitiesError } = useSWR(
    "activities",
    () => activityAPI.getAll()
  );

  const { data: themes } = useSWR("themes", () => themeAPI.getThemes());

  // const { data: vibes } = useSWR("vibes", () => themeAPI.getVibes());

  // Fetch weekend plan based on selected date
  const {
    data: currentWeekendPlan,
    mutate: mutateCurrentPlan,
    error: planError,
  } = useSWR(
    token && selectedDate ? `weekend-plan-${selectedDate}` : null,
    () => planAPI.getByDate(selectedDate),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const [localPlan, setLocalPlan] = useState({ saturday: [], sunday: [] });
  const [selectedTheme, setSelectedTheme] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeContentTab, setActiveContentTab] = useState("activities");
  const [userLocation, setUserLocation] = useState(null);

  // Get user's location for places
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Geolocation error:", error);
          // Use default location (Delhi) if geolocation fails
          setUserLocation({ lat: 28.6139, lng: 77.209 });
        }
      );
    } else {
      // Use default location if geolocation is not supported
      setUserLocation({ lat: 28.6139, lng: 77.209 });
    }
  }, []);

  // Handle date change
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  // Handle plan loading for specific date
  const handlePlanLoad = async (date) => {
    try {
      const plan = await planAPI.getByDate(date);
      if (plan) {
        // Convert weekend plan format to local plan format
        const convertedPlan = {
          saturday: (plan.saturday_activities || [])
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((item) => {
              // Handle external activities
              if (item.external_activity) {
                return {
                  ...item,
                  day: "saturday",
                  activity: {
                    _id: item.external_activity.id,
                    ...item.external_activity, // Flatten external activity data
                  },
                };
              }
              // Handle regular activities
              return {
                ...item,
                day: "saturday",
                activity: item.activity
                  ? {
                      _id: item.activity._id,
                      ...item.activity, // Spread all activity fields
                    }
                  : item.activity_data
                  ? {
                      _id: item.activity_data._id,
                      ...item.activity_data, // Use activity_data if available
                    }
                  : { _id: null },
              };
            }),
          sunday: (plan.sunday_activities || [])
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((item) => {
              // Handle external activities
              if (item.external_activity) {
                return {
                  ...item,
                  day: "sunday",
                  activity: {
                    _id: item.external_activity.id,
                    ...item.external_activity, // Flatten external activity data
                  },
                };
              }
              // Handle regular activities
              return {
                ...item,
                day: "sunday",
                activity: item.activity
                  ? {
                      _id: item.activity._id,
                      ...item.activity, // Spread all activity fields
                    }
                  : item.activity_data
                  ? {
                      _id: item.activity_data._id,
                      ...item.activity_data, // Use activity_data if available
                    }
                  : { _id: null },
              };
            }),
        };
        setLocalPlan(convertedPlan);
        console.log("Plan loaded successfully:", convertedPlan);
      } else {
        console.log("No plan found for date:", date);
        setLocalPlan({ saturday: [], sunday: [] });
      }
    } catch (error) {
      console.error("Error loading plan:", error);
      setNotification({
        type: "error",
        message: "Failed to load plan for selected date",
      });
    }
  };

  useEffect(() => {
    // Load weekend plan data
    if (currentWeekendPlan) {
      const saturday = (currentWeekendPlan.saturday_activities || [])
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((item) => {
          // Handle external activities
          if (item.external_activity) {
            return {
              ...item,
              day: "saturday",
              activity: {
                _id: item.external_activity.id,
                ...item.external_activity, // Flatten external activity data
              },
            };
          }
          // Handle regular activities
          return {
            ...item,
            day: "saturday",
            activity: item.activity
              ? {
                  _id: item.activity._id,
                  ...item.activity, // Spread all activity fields
                }
              : item.activity_data
              ? {
                  _id: item.activity_data._id,
                  ...item.activity_data, // Use activity_data if available
                }
              : { _id: null },
          };
        });

      const sunday = (currentWeekendPlan.sunday_activities || [])
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((item) => {
          // Handle external activities
          if (item.external_activity) {
            return {
              ...item,
              day: "sunday",
              activity: {
                _id: item.external_activity.id,
                ...item.external_activity, // Flatten external activity data
              },
            };
          }
          // Handle regular activities
          return {
            ...item,
            day: "sunday",
            activity: item.activity
              ? {
                  _id: item.activity._id,
                  ...item.activity, // Spread all activity fields
                }
              : item.activity_data
              ? {
                  _id: item.activity_data._id,
                  ...item.activity_data, // Use activity_data if available
                }
              : { _id: null },
          };
        });

      setLocalPlan({ saturday, sunday });
    }
  }, [currentWeekendPlan]);

  // Load plan when date changes
  useEffect(() => {
    if (selectedDate && isAuthenticated) {
      handlePlanLoad(selectedDate);
    }
  }, [selectedDate, isAuthenticated]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const savePlan = async (plan) => {
    if (!isAuthenticated) {
      showNotification("Please login to save your plan", "error");
      return;
    }

    setIsLoading(true);
    try {
      const saturdayActivities = plan.saturday.map((item, idx) => {
        const activity = item.activity;
        const isExternalActivity = activity?.source || activity?.external_id;

        if (isExternalActivity) {
          // Send external activity data
          return {
            activity: null, // No database reference
            external_activity: {
              id: activity.id || activity._id,
              title: activity.title,
              description: activity.description,
              category: activity.category,
              subcategory: activity.subcategory,
              durationMin: activity.durationMin,
              icon: activity.icon,
              color: activity.color,
              images: activity.images || [],
              rating: activity.rating,
              source: activity.source,
              external_id: activity.external_id,
              location: activity.location,
              address: activity.address,
              coordinates: activity.coordinates,
              release_date: activity.release_date,
              poster_path: activity.poster_path,
              backdrop_path: activity.backdrop_path,
              opening_hours: activity.opening_hours,
              types: activity.types,
            },
            order: idx,
            startTime: item.startTime || "09:00",
            endTime:
              item.endTime ||
              calculateEndTime(
                item.startTime || "09:00",
                activity?.durationMin || 60
              ),
            vibe: item.vibe || "",
            notes: item.notes || "",
            completed: item.completed || false,
            rating: item.rating || null,
            review: item.review || "",
          };
        } else {
          // Send regular database activity with full data
          return {
            activity: activity._id || activity,
            activity_data: {
              _id: activity._id,
              title: activity.title,
              description: activity.description,
              category: activity.category,
              subcategory: activity.subcategory,
              durationMin: activity.durationMin,
              icon: activity.icon,
              color: activity.color,
              image: activity.image,
              images: activity.images || [],
              rating: activity.rating,
              location: activity.location,
              address: activity.address,
              coordinates: activity.coordinates,
              opening_hours: activity.opening_hours,
              types: activity.types,
              source: activity.source,
              external_id: activity.external_id,
              release_date: activity.release_date,
              poster_path: activity.poster_path,
              backdrop_path: activity.backdrop_path,
              ...activity, // Spread all other fields to ensure nothing is missed
            },
            order: idx,
            startTime: item.startTime || "09:00",
            endTime:
              item.endTime ||
              calculateEndTime(
                item.startTime || "09:00",
                activity?.durationMin || 60
              ),
            vibe: item.vibe || "",
            notes: item.notes || "",
            completed: item.completed || false,
            rating: item.rating || null,
            review: item.review || "",
          };
        }
      });

      const sundayActivities = plan.sunday.map((item, idx) => {
        const activity = item.activity;
        const isExternalActivity = activity?.source || activity?.external_id;

        if (isExternalActivity) {
          // Send external activity data
          return {
            activity: null, // No database reference
            external_activity: {
              id: activity.id || activity._id,
              title: activity.title,
              description: activity.description,
              category: activity.category,
              subcategory: activity.subcategory,
              durationMin: activity.durationMin,
              icon: activity.icon,
              color: activity.color,
              images: activity.images || [],
              rating: activity.rating,
              source: activity.source,
              external_id: activity.external_id,
              location: activity.location,
              address: activity.address,
              coordinates: activity.coordinates,
              release_date: activity.release_date,
              poster_path: activity.poster_path,
              backdrop_path: activity.backdrop_path,
              opening_hours: activity.opening_hours,
              types: activity.types,
            },
            order: idx,
            startTime: item.startTime || "09:00",
            endTime:
              item.endTime ||
              calculateEndTime(
                item.startTime || "09:00",
                activity?.durationMin || 60
              ),
            vibe: item.vibe || "",
            notes: item.notes || "",
            completed: item.completed || false,
            rating: item.rating || null,
            review: item.review || "",
          };
        } else {
          // Send regular database activity with full data
          return {
            activity: activity._id || activity,
            activity_data: {
              _id: activity._id,
              title: activity.title,
              description: activity.description,
              category: activity.category,
              subcategory: activity.subcategory,
              durationMin: activity.durationMin,
              icon: activity.icon,
              color: activity.color,
              image: activity.image,
              images: activity.images || [],
              rating: activity.rating,
              location: activity.location,
              address: activity.address,
              coordinates: activity.coordinates,
              opening_hours: activity.opening_hours,
              types: activity.types,
              source: activity.source,
              external_id: activity.external_id,
              release_date: activity.release_date,
              poster_path: activity.poster_path,
              backdrop_path: activity.backdrop_path,
              ...activity, // Spread all other fields to ensure nothing is missed
            },
            order: idx,
            startTime: item.startTime || "09:00",
            endTime:
              item.endTime ||
              calculateEndTime(
                item.startTime || "09:00",
                activity?.durationMin || 60
              ),
            vibe: item.vibe || "",
            notes: item.notes || "",
            completed: item.completed || false,
            rating: item.rating || null,
            review: item.review || "",
          };
        }
      });

      const weekendPlanData = {
        weekend_date: selectedDate,
        status: currentWeekendPlan?.status || "planning",
        saturday_activities: saturdayActivities,
        sunday_activities: sundayActivities,
        tags: selectedTheme ? [selectedTheme] : [],
      };

      await planAPI.save(weekendPlanData);
      mutateCurrentPlan();

      showNotification("Plan saved successfully!", "success");
    } catch (error) {
      if (error.message.includes("conflicts")) {
        showNotification(`Time conflicts detected: ${error.message}`, "error");
      } else {
        showNotification(error.message || "Failed to save plan", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const exportSVG = async () => {
    if (!isAuthenticated) {
      showNotification("Please login to export", "error");
      return;
    }

    try {
      if (!currentWeekendPlan) {
        showNotification("No plan to export", "error");
        return;
      }

      const svg = await planAPI.export(currentWeekendPlan._id);

      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `weekend-plan-${selectedDate || "current"}.svg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showNotification("Plan exported successfully!", "success");
    } catch (error) {
      showNotification(`Export failed: ${error.message}`, "error");
    }
  };

  const addActivity = (activity) => {
    if (!isAuthenticated) {
      showNotification("Please login to add activities", "error");
      return;
    }

    // If activity has day, startTime, and endTime, use them
    const day = activity.day || "sunday";
    const startTime = activity.startTime || "09:00";
    const endTime =
      activity.endTime || calculateEndTime(startTime, activity.durationMin);

    // Check if this is an external activity (has source field)
    const isExternalActivity = activity.source || activity.external_id;

    const newItem = {
      _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      activity: isExternalActivity
        ? activity
        : {
            _id: activity._id,
            title: activity.title,
            description: activity.description,
            category: activity.category,
            subcategory: activity.subcategory,
            durationMin: activity.durationMin,
            icon: activity.icon,
            color: activity.color,
            image: activity.image,
            images: activity.images || [],
            rating: activity.rating,
            location: activity.location,
            address: activity.address,
            coordinates: activity.coordinates,
            opening_hours: activity.opening_hours,
            types: activity.types,
            source: activity.source,
            external_id: activity.external_id,
            release_date: activity.release_date,
            poster_path: activity.poster_path,
            backdrop_path: activity.backdrop_path,
            ...activity, // Spread all other fields to ensure nothing is missed
          },
      day,
      order: localPlan[day].length,
      startTime,
      endTime,
      vibe: activity.vibe || "",
      notes: activity.notes || "",
    };

    setLocalPlan((prev) => ({
      ...prev,
      [day]: [...prev[day], newItem],
    }));

    showNotification(
      `Activity added to ${day.charAt(0).toUpperCase() + day.slice(1)}`,
      "success"
    );
  };

  const handleActivityUpdate = (action, activity) => {
    // This function will be called when activities are created, updated, or deleted
    // We can use SWR's mutate to refresh the activities list
    if (action === "create" || action === "update" || action === "delete") {
      // Trigger a re-fetch of activities
      window.location.reload(); // Simple approach - in production you'd want to use SWR's mutate
    }
  };

  const calculateEndTime = (startTime, duration) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMins
      .toString()
      .padStart(2, "0")}`;
  };

  const handleThemeChange = (themeId) => {
    setSelectedTheme(themeId);
    // Apply theme-based filtering to activities
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;

    console.log("Drag ended:", { source, destination });

    // If dropped outside a valid drop zone
    if (!destination) {
      console.log("No destination, drag cancelled");
      return;
    }

    // If dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Handle drag from activities panel to schedule
    if (
      source.droppableId === "activities" &&
      (destination.droppableId === "saturday" ||
        destination.droppableId === "sunday")
    ) {
      console.log("Dragging from activities to schedule");
      // We need to get the activity from the filtered list, not the original activities array
      const filteredActivities = activities || [];
      const activity = filteredActivities[source.index];
      console.log("Activity:", activity);
      if (!activity) {
        console.log("No activity found at index:", source.index);
        return;
      }

      const day = destination.droppableId;
      const startTime = "09:00";
      const endTime = calculateEndTime(startTime, activity.durationMin);

      const newItem = {
        _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        activity: {
          _id: activity._id,
          title: activity.title,
          description: activity.description,
          category: activity.category,
          subcategory: activity.subcategory,
          durationMin: activity.durationMin,
          icon: activity.icon,
          color: activity.color,
          image: activity.image,
          images: activity.images || [],
          rating: activity.rating,
          location: activity.location,
          address: activity.address,
          coordinates: activity.coordinates,
          opening_hours: activity.opening_hours,
          types: activity.types,
          source: activity.source,
          external_id: activity.external_id,
          release_date: activity.release_date,
          poster_path: activity.poster_path,
          backdrop_path: activity.backdrop_path,
          ...activity, // Spread all other fields to ensure nothing is missed
        },
        day,
        order: localPlan[day].length,
        startTime,
        endTime,
        vibe: "",
        notes: "",
      };

      setLocalPlan((prev) => ({
        ...prev,
        [day]: [...prev[day], newItem],
      }));

      showNotification(
        `Activity added to ${day.charAt(0).toUpperCase() + day.slice(1)}`,
        "success"
      );
      return;
    }

    // Handle reordering within schedule (existing functionality)
    if (source.droppableId === "saturday" || source.droppableId === "sunday") {
      const srcDay = source.droppableId;
      const dstDay = destination.droppableId;
      const srcList = Array.from(localPlan[srcDay] || []);
      const dstList = Array.from(localPlan[dstDay] || []);

      const [moved] = srcList.splice(source.index, 1);
      moved.day = dstDay;
      dstList.splice(destination.index, 0, moved);

      setLocalPlan((prev) => ({
        ...prev,
        [srcDay]: srcList,
        [dstDay]: dstList,
      }));
    }
  };

  // if (activitiesError || planError) {
  //   return (
  //     <div className="flex items-center justify-center min-h-[400px]">
  //       <div className="text-center">
  //         <div className="text-6xl mb-4">😞</div>
  //         <h2 className="text-2xl font-bold text-gray-800 mb-2">
  //           Something went wrong
  //         </h2>
  //         <p className="text-gray-600">Please try refreshing the page</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative min-h-[88vh] flex items-center justify-center overflow-hidden rounded">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/1pLdD0Zzfrmgq22QcWZQJnKcZWjPql74QsoEKZ7Tlp6zJcfRnBSNCSY5_ZNB_A65KmXZyRX_Ulcir57C0aectNrmf4GRJk--rN2oWQhPaN6atHHdtUo=w1082')`,
          }}
        >
          <div className="absolute inset-0 bg-zen-black/40"></div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-zen-white mb-6 drop-shadow-lg">
            Plan Your Perfect
            <span className="text-zen-lime block"> Weekend</span>
          </h1>
          <TypingText
            texts={[
              "Discover activities, create schedules, and make every weekend memorable",
              "From outdoor adventures to cozy indoor activities",
              "Build your ideal weekend with just a few clicks",
              "Turn your free time into unforgettable experiences",
            ]}
            className="text-xl md:text-2xl text-zen-white max-w-3xl mx-auto drop-shadow-md"
          />
        </motion.div>
      </div>

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

      {/* Main Content */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Content Panel with Tabs */}
          <div className="lg:col-span-1">
            {/* Tab Navigation */}
            <div className="bg-zen-white rounded-t-2xl border border-zen-light-gray border-b-0 p-4">
              <div className="flex space-x-2 bg-zen-light-gray rounded-lg p-1">
                <button
                  onClick={() => setActiveContentTab("activities")}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeContentTab === "activities"
                      ? "bg-zen-white text-zen-black shadow-sm"
                      : "text-zen-black hover:bg-zen-white/50"
                  }`}
                >
                  🎯 Activities
                </button>
                <button
                  onClick={() => setActiveContentTab("movies")}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeContentTab === "movies"
                      ? "bg-zen-white text-zen-black shadow-sm"
                      : "text-zen-black hover:bg-zen-white/50"
                  }`}
                >
                  🎬 Movies
                </button>
                <button
                  onClick={() => setActiveContentTab("places")}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeContentTab === "places"
                      ? "bg-zen-white text-zen-black shadow-sm"
                      : "text-zen-black hover:bg-zen-white/50"
                  }`}
                >
                  📍 Places
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="rounded-b-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeContentTab}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeContentTab === "activities" && (
                    <ActivitiesPanel
                      activities={activities || []}
                      onAdd={addActivity}
                      onActivityUpdate={handleActivityUpdate}
                      selectedTheme={selectedTheme}
                      showTimeSelector={true}
                      existingPlan={localPlan}
                    />
                  )}
                  {activeContentTab === "movies" && (
                    <MoviesPanel onAdd={addActivity} />
                  )}
                  {activeContentTab === "places" && (
                    <PlacesPanel
                      onAdd={addActivity}
                      userLocation={userLocation}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Schedule Board */}
          <div className="lg:col-span-2">
            <ScheduleBoard
              plan={localPlan}
              setPlan={setLocalPlan}
              onSave={() => savePlan(localPlan)}
              themes={themes || []}
              selectedTheme={selectedTheme}
              onThemeChange={handleThemeChange}
              onDragEnd={onDragEnd}
              selectedDate={selectedDate}
              weekendPlan={currentWeekendPlan}
              onDateChange={handleDateChange}
              onPlanLoad={handlePlanLoad}
            />
          </div>
        </div>
      </DragDropContext>
      {/* Date Selection and Controls */}
      <div className="bg-zen-white rounded-2xl shadow-xl border border-zen-light-gray p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-zen-black mb-2">
                Select Weekend Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-zen-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-zen-lime"
              />
            </div>
            <div className="text-sm text-zen-black">
              <div className="font-medium">Weekend Overview</div>
              <div>
                Saturday:{" "}
                {formatDateShort(getWeekendDates(selectedDate).saturday)}
              </div>
              <div>
                Sunday: {formatDateShort(getWeekendDates(selectedDate).sunday)}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="/profile"
              className={
                isAuthenticated ? "btn btn-secondary" : "btn btn-disabled"
              }
            >
              👤 View Profile & History
            </a>

            <button
              onClick={exportSVG}
              disabled={!isAuthenticated}
              className={
                isAuthenticated ? "btn btn-primary" : "btn btn-disabled"
              }
            >
              📄 Export Plan
            </button>
          </div>
        </div>

        {currentWeekendPlan && (
          <div className="mt-4 p-3 bg-zen-light-gray rounded-lg">
            <div className="text-sm text-zen-black">
              <strong>Current Plan Status:</strong> {currentWeekendPlan.status}{" "}
              |<strong> Created:</strong>{" "}
              {formatDateShort(currentWeekendPlan.createdAt)}
              {currentWeekendPlan.total_estimated_cost && (
                <span>
                  {" "}
                  | <strong>Estimated Cost:</strong> $
                  {currentWeekendPlan.total_estimated_cost}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-zen-black/50 flex items-center justify-center z-50">
          <div className="bg-zen-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zen-lime"></div>
            <span className="text-zen-black">Saving your plan...</span>
          </div>
        </div>
      )}
    </div>
  );
}
