"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../lib/AuthContext";

const MovieCard = ({ movie, onAdd, isAuthenticated }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedDay, setSelectedDay] = useState("saturday");
  const [startTime, setStartTime] = useState("19:00"); // Default to evening

  const handleAddToWeekend = () => {
    if (!isAuthenticated) return;

    // Convert movie to activity format that matches localPlan structure
    const movieActivity = {
      _id: `movie_${movie.id}`,
      title: movie.title,
      description: movie.description,
      category: movie.category,
      subcategory: movie.subcategory,
      durationMin: movie.durationMin,
      icon: movie.icon,
      color: movie.color,
      images: movie.poster_path ? [movie.poster_path] : [],
      rating: movie.rating,
      source: movie.source,
      external_id: movie.external_id,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      day: selectedDay,
      startTime: startTime,
      endTime: calculateEndTime(startTime, movie.durationMin),
      vibe: "entertaining",
      notes: `${
        movie.now_playing
          ? "Now Playing"
          : movie.upcoming
          ? "Upcoming Release"
          : "Popular Movie"
      } - Rating: ${movie.rating}/10`,
    };

    onAdd(movieActivity);
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

  const formatRating = (rating) => {
    return rating ? `⭐ ${rating.toFixed(1)}/10` : "No rating";
  };

  const formatReleaseDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-zen-white rounded-xl shadow-sm border border-zen-light-gray overflow-hidden hover:shadow-lg transition-all duration-200"
    >
      {/* Movie Poster */}
      {movie.poster_path && (
        <div className="relative h-48 bg-cover bg-center">
          <img
            src={movie.poster_path}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

          {/* Movie badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {movie.now_playing && (
              <span className="bg-zen-lime text-zen-black text-xs px-2 py-1 rounded-full font-medium">
                Now Playing
              </span>
            )}
            {movie.upcoming && (
              <span className="bg-zen-black text-zen-white text-xs px-2 py-1 rounded-full font-medium">
                Coming Soon
              </span>
            )}
          </div>

          {/* Rating overlay */}
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {formatRating(movie.rating)}
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-zen-black text-lg leading-tight mb-1">
              {movie.title}
            </h3>
            <p className="text-sm text-zen-black mb-2">
              {movie.subcategory} • {formatReleaseDate(movie.release_date)}
            </p>
            <p className="text-sm text-zen-black line-clamp-2 mb-3">
              {movie.description || "No description available"}
            </p>
          </div>
        </div>

        {/* Movie details */}
        <div className="flex items-center justify-between text-xs text-zen-black mb-3">
          <span className="bg-zen-light-gray px-2 py-1 rounded">
            {movie.durationMin}min
          </span>
          <span className="flex items-center gap-1">
            {movie.icon} {movie.category}
          </span>
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
              Duration: {movie.durationMin} minutes (ends at{" "}
              {calculateEndTime(startTime, movie.durationMin)})
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

export default function MoviesPanel({ onAdd }) {
  const { isAuthenticated } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("trending");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchMovies = async (tab, pageNum = 1, append = false) => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = {
        trending: "/api/external/movies/trending",
        "now-playing": "/api/external/movies/now-playing",
        upcoming: "/api/external/movies/upcoming",
      }[tab];

      const response = await fetch(`${endpoint}?page=${pageNum}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch movies");
      }

      if (append) {
        setMovies((prev) => [...prev, ...data.movies]);
      } else {
        setMovies(data.movies);
      }

      setHasMore(data.pagination.current_page < data.pagination.total_pages);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching movies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(activeTab, 1, false);
    setPage(1);
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setMovies([]);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovies(activeTab, nextPage, true);
  };

  const tabs = [
    { id: "trending", label: "🔥 Trending", icon: "🔥" },
    { id: "now-playing", label: "🎬 Now Playing", icon: "🎬" },
    { id: "upcoming", label: "🚀 Coming Soon", icon: "🚀" },
  ];

  return (
    <div className="bg-zen-white rounded-b-2xl shadow-xl border border-zen-light-gray border-t-0 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zen-black">Movies</h2>
        <div className="text-sm text-zen-black">
          Perfect for weekend entertainment
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-6 bg-zen-light-gray rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeTab === tab.id
                ? "bg-zen-white text-zen-black shadow-sm"
                : "text-zen-black hover:bg-zen-white/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-red-500">⚠️</span>
            <div>
              <p className="text-red-700 font-medium">Failed to load movies</p>
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={() => fetchMovies(activeTab, 1, false)}
                className="text-red-600 text-sm underline mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Movies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
        <AnimatePresence>
          {movies.map((movie) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <MovieCard
                movie={movie}
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
          <span className="ml-2 text-zen-black">Loading movies...</span>
        </div>
      )}

      {/* Load More Button */}
      {!loading && hasMore && movies.length > 0 && (
        <div className="flex justify-center mt-6">
          <button onClick={loadMore} className="btn btn-secondary">
            Load More Movies
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && movies.length === 0 && !error && (
        <div className="text-center py-12 text-zen-black">
          <div className="text-4xl mb-4">🎬</div>
          <p className="text-lg font-medium">No movies found</p>
          <p className="text-sm">Try switching to a different tab</p>
        </div>
      )}
    </div>
  );
}
