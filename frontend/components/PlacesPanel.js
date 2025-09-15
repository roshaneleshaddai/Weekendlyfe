"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../lib/AuthContext";

const PlaceCard = ({ place, onAdd, isAuthenticated }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedDay, setSelectedDay] = useState("saturday");
  const [startTime, setStartTime] = useState("10:00"); // Default to morning

  const handleAddToWeekend = () => {
    if (!isAuthenticated) return;

    // Convert place to activity format that matches localPlan structure
    const placeActivity = {
      _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Use proper temp ID
      title: place.title,
      description: place.description,
      category: place.category,
      subcategory: place.subcategory,
      location: place.location,
      address: place.address,
      coordinates: place.coordinates,
      durationMin: place.durationMin,
      icon: place.icon,
      color: place.color,
      images: place.photos?.slice(0, 3) || [],
      rating: place.rating,
      review_count: place.review_count,
      source: place.source,
      external_id: place.id, // Store the Google Places ID here instead
      opening_hours: place.opening_hours,
      types: place.types,
      price_level: place.price_level,
      day: selectedDay,
      startTime: startTime,
      endTime: calculateEndTime(startTime, place.durationMin),
      vibe: "adventurous",
      notes: `${place.subcategory} - Rating: ${place.rating}/5 (${place.review_count} reviews)`,
    };

    onAdd(placeActivity);
    setShowDetails(false);
  };

  const calculateEndTime = (start, duration) => {
    const [hours, minutes] = start.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMins
      .toString()
      .padStart(2, "0")}`;
  };

  const formatRating = (rating, reviewCount) => {
    if (!rating) return "No rating";
    return `⭐ ${rating.toFixed(1)}/5 ${
      reviewCount ? `(${reviewCount} reviews)` : ""
    }`;
  };

  const getPriceLevelText = (priceLevel) => {
    const levels = {
      0: "Free",
      1: "$",
      2: "$$",
      3: "$$$",
      4: "$$$$",
    };
    return levels[priceLevel] || "Price unknown";
  };

  const getOpenStatus = (openNow) => {
    if (openNow === undefined) return null;
    return openNow ? "🟢 Open now" : "🔴 Closed now";
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-zen-white rounded-xl shadow-sm border border-zen-light-gray overflow-hidden hover:shadow-lg transition-all duration-200"
    >
      {/* Place Photo */}
      {place.photos && place.photos.length > 0 && (
        <div className="relative h-48 bg-cover bg-center">
          <img
            src={place.photos[0]}
            alt={place.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

          {/* Rating overlay */}
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {formatRating(place.rating, place.review_count)}
          </div>

          {/* Price level */}
          {place.price_level !== undefined && (
            <div className="absolute bottom-2 right-2 bg-zen-lime text-zen-black text-xs px-2 py-1 rounded font-medium">
              {getPriceLevelText(place.price_level)}
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-zen-black text-lg leading-tight mb-1">
              {place.title}
            </h3>
            <p className="text-sm text-zen-black mb-1">{place.subcategory}</p>
            {place.location && (
              <p className="text-xs text-zen-black mb-2 flex items-center gap-1">
                📍 {place.location}
              </p>
            )}
            <p className="text-sm text-zen-black line-clamp-2 mb-3">
              {place.description}
            </p>
          </div>
        </div>

        {/* Place details */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs text-zen-black">
            <span className="bg-zen-light-gray px-2 py-1 rounded">
              {place.durationMin}min visit
            </span>
            <span className="flex items-center gap-1">
              {place.icon} {place.category}
            </span>
          </div>

          {/* Opening hours status */}
          {getOpenStatus(place.opening_hours) && (
            <div className="text-xs">{getOpenStatus(place.opening_hours)}</div>
          )}

          {/* Distance (if coordinates available) */}
          {place.coordinates && (
            <div className="text-xs text-zen-black">
              📍 Coordinates: {place.coordinates.lat.toFixed(4)},{" "}
              {place.coordinates.lng.toFixed(4)}
            </div>
          )}
        </div>

        {/* Add to weekend form */}
        {showDetails ? (
          <div className="space-y-3 border-t border-zen-light-gray pt-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-zen-black block mb-1">
                  Day
                </label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full px-2 py-1 border border-zen-light-gray rounded text-xs focus:outline-none focus:ring-1 focus:ring-zen-lime"
                >
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-zen-black block mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-2 py-1 border border-zen-light-gray rounded text-xs focus:outline-none focus:ring-1 focus:ring-zen-lime"
                />
              </div>
            </div>

            <div className="text-xs text-zen-black">
              Duration: {place.durationMin} minutes (ends at{" "}
              {calculateEndTime(startTime, place.durationMin)})
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddToWeekend}
                disabled={!isAuthenticated}
                className={
                  isAuthenticated
                    ? "btn btn-primary flex-1 text-xs"
                    : "btn btn-disabled flex-1 text-xs"
                }
              >
                {isAuthenticated ? "Add to Weekend" : "Login to Add"}
              </button>
              <button
                onClick={() => setShowDetails(false)}
                className="btn btn-outline text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDetails(true)}
            className="btn btn-secondary w-full text-sm"
          >
            Add to Weekend Plan
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default function PlacesPanel({ onAdd, userLocation }) {
  const { isAuthenticated } = useAuth();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [placeType, setPlaceType] = useState("tourist_attraction");
  const [radius, setRadius] = useState(10000);

  // Default location (Delhi) or use user's location
  const defaultLocation = { lat: 28.6139, lng: 77.209 };
  const currentLocation = userLocation || defaultLocation;

  const fetchPlaces = async (type = placeType) => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = "/api/external/places/popular";
      const params = new URLSearchParams({
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        radius: radius,
        type: type,
      });

      const response = await fetch(`${endpoint}?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch places");
      }

      setPlaces(data.places || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching places:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces(placeType);
  }, [placeType, radius, currentLocation]);

  const handleTypeChange = (type) => {
    setPlaceType(type);
    setPlaces([]);
  };

  const placeTypes = [
    { id: "tourist_attraction", label: "🏛️ Attractions", icon: "🏛️" },
    { id: "restaurant", label: "🍽️ Restaurants", icon: "🍽️" },
    { id: "museum", label: "🏛️ Museums", icon: "🏛️" },
    { id: "park", label: "🌳 Parks", icon: "🌳" },
    { id: "shopping_mall", label: "🛍️ Shopping", icon: "🛍️" },
    { id: "movie_theater", label: "🎬 Cinemas", icon: "🎬" },
    { id: "amusement_park", label: "🎢 Theme Parks", icon: "🎢" },
    { id: "zoo", label: "🦁 Zoos", icon: "🦁" },
    { id: "aquarium", label: "🐠 Aquariums", icon: "🐠" },
    { id: "art_gallery", label: "🎨 Art Galleries", icon: "🎨" },
  ];

  const radiusOptions = [
    { value: 5000, label: "5km" },
    { value: 10000, label: "10km" },
    { value: 25000, label: "25km" },
    { value: 50000, label: "50km" },
  ];

  return (
    <div className="bg-zen-white rounded-b-2xl shadow-xl border border-zen-light-gray border-t-0 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zen-black">Popular Places</h2>
        <div className="text-sm text-zen-black">
          Discover amazing places near you
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4 mb-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={placeType}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="px-3 py-2 bg-zen-light-gray border border-zen-light-gray rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zen-lime"
          >
            {placeTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="px-3 py-2 bg-zen-light-gray border border-zen-light-gray rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zen-lime"
          >
            {radiusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                Within {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchPlaces(placeType)}
            className="btn btn-secondary text-sm"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-red-500">⚠️</span>
            <div>
              <p className="text-red-700 font-medium">Failed to load places</p>
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={() => fetchPlaces(placeType)}
                className="text-red-600 text-sm underline mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Places Grid */}
      <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto">
        <AnimatePresence>
          {places.map((place) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PlaceCard
                place={place}
                onAdd={onAdd}
                isAuthenticated={isAuthenticated}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zen-lime"></div>
          <span className="ml-2 text-zen-black">Loading places...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && places.length === 0 && !error && (
        <div className="text-center py-12 text-zen-black">
          <div className="text-4xl mb-4">📍</div>
          <p className="text-lg font-medium">No places found</p>
          <p className="text-sm">
            Try changing the filters or increasing the search radius
          </p>
        </div>
      )}

      {/* Location Info */}
      <div className="mt-4 text-xs text-zen-black bg-zen-light-gray rounded-lg p-3">
        📍 Searching near:{" "}
        {currentLocation === defaultLocation
          ? "Delhi, India (default)"
          : "Your location"}
        <br />
        Coordinates: {currentLocation.lat.toFixed(4)},{" "}
        {currentLocation.lng.toFixed(4)}
      </div>
    </div>
  );
}
