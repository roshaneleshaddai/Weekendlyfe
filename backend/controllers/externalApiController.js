const axios = require("axios");

// TMDB API Configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY || "946a34379675d71e136497a29a49b6a5";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Google Places API Configuration
const GOOGLE_PLACES_API_KEY =
  process.env.GOOGLE_PLACES_API_KEY || "your_google_places_api_key_here";
const GOOGLE_PLACES_BASE_URL = "https://maps.googleapis.com/maps/api/place";

// Get popular/trending movies
const getTrendingMovies = async (req, res) => {
  try {
    const { page = 1, time_window = "week" } = req.query;

    // Check if API key is configured
    if (TMDB_API_KEY === "your_tmdb_api_key_here") {
      return res.status(400).json({
        error: "TMDB API key not configured",
        details: "Please set TMDB_API_KEY in your environment variables",
      });
    }

    const response = await axios.get(
      `${TMDB_BASE_URL}/trending/movie/${time_window}`,
      {
        params: {
          api_key: TMDB_API_KEY,
          page: page,
          language: "en-US",
        },
      }
    );

    // Transform the data to match our activity structure
    const movies = response.data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      description: movie.overview,
      category: "Entertainment",
      subcategory: "Movies",
      poster_path: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      backdrop_path: movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
        : null,
      release_date: movie.release_date,
      rating: movie.vote_average,
      popularity: movie.popularity,
      adult: movie.adult,
      genre_ids: movie.genre_ids,
      original_language: movie.original_language,
      durationMin: 120, // Default movie duration
      icon: "🎬",
      color: "#FF6B6B",
      source: "tmdb",
      external_id: movie.id,
    }));

    res.json({
      movies,
      pagination: {
        current_page: parseInt(page),
        total_pages: response.data.total_pages,
        total_results: response.data.total_results,
      },
    });
  } catch (error) {
    console.error("TMDB API Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to fetch trending movies",
      details: error.response?.data?.status_message || error.message,
    });
  }
};

// Get now playing movies
const getNowPlayingMovies = async (req, res) => {
  try {
    const { page = 1, region = "US" } = req.query;

    // Check if API key is configured
    if (TMDB_API_KEY === "your_tmdb_api_key_here") {
      return res.status(400).json({
        error: "TMDB API key not configured",
        details: "Please set TMDB_API_KEY in your environment variables",
      });
    }

    const response = await axios.get(`${TMDB_BASE_URL}/movie/now_playing`, {
      params: {
        api_key: TMDB_API_KEY,
        page: page,
        language: "en-US",
        region: region,
      },
    });

    const movies = response.data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      description: movie.overview,
      category: "Entertainment",
      subcategory: "Movies",
      poster_path: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      backdrop_path: movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
        : null,
      release_date: movie.release_date,
      rating: movie.vote_average,
      popularity: movie.popularity,
      adult: movie.adult,
      genre_ids: movie.genre_ids,
      original_language: movie.original_language,
      durationMin: 120,
      icon: "🎬",
      color: "#FF6B6B",
      source: "tmdb",
      external_id: movie.id,
      now_playing: true,
    }));

    res.json({
      movies,
      pagination: {
        current_page: parseInt(page),
        total_pages: response.data.total_pages,
        total_results: response.data.total_results,
      },
    });
  } catch (error) {
    console.error("TMDB API Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to fetch now playing movies",
      details: error.response?.data?.status_message || error.message,
    });
  }
};

// Get upcoming movies
const getUpcomingMovies = async (req, res) => {
  try {
    const { page = 1, region = "US" } = req.query;

    // Check if API key is configured
    if (TMDB_API_KEY === "your_tmdb_api_key_here") {
      return res.status(400).json({
        error: "TMDB API key not configured",
        details: "Please set TMDB_API_KEY in your environment variables",
      });
    }

    const response = await axios.get(`${TMDB_BASE_URL}/movie/upcoming`, {
      params: {
        api_key: TMDB_API_KEY,
        page: page,
        language: "en-US",
        region: region,
      },
    });

    const movies = response.data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      description: movie.overview,
      category: "Entertainment",
      subcategory: "Movies",
      poster_path: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      backdrop_path: movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
        : null,
      release_date: movie.release_date,
      rating: movie.vote_average,
      popularity: movie.popularity,
      adult: movie.adult,
      genre_ids: movie.genre_ids,
      original_language: movie.original_language,
      durationMin: 120,
      icon: "🎬",
      color: "#FF6B6B",
      source: "tmdb",
      external_id: movie.id,
      upcoming: true,
    }));

    res.json({
      movies,
      pagination: {
        current_page: parseInt(page),
        total_pages: response.data.total_pages,
        total_results: response.data.total_results,
      },
    });
  } catch (error) {
    console.error("TMDB API Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to fetch upcoming movies",
      details: error.response?.data?.status_message || error.message,
    });
  }
};

// Get popular places using Google Places API
const getPopularPlaces = async (req, res) => {
  try {
    const {
      lat = 28.6139, // Default to Delhi
      lng = 77.209,
      radius = 10000, // 10km radius
      type = "tourist_attraction",
      page_token = null,
    } = req.query;

    // Check if API key is configured
    if (GOOGLE_PLACES_API_KEY === "your_google_places_api_key_here") {
      return res.status(400).json({
        error: "Google Places API key not configured",
        details:
          "Please set GOOGLE_PLACES_API_KEY in your environment variables",
      });
    }

    let url = `${GOOGLE_PLACES_BASE_URL}/nearbysearch/json`;
    let params = {
      key: GOOGLE_PLACES_API_KEY,
      location: `${lat},${lng}`,
      radius: radius,
      type: type,
      language: "en",
    };

    if (page_token) {
      params.pagetoken = page_token;
    }

    const response = await axios.get(url, { params });

    // Check if the response is valid
    if (
      response.data.status !== "OK" &&
      response.data.status !== "ZERO_RESULTS"
    ) {
      throw new Error(
        `Google Places API Error: ${response.data.status} - ${
          response.data.error_message || "Unknown error"
        }`
      );
    }

    // Transform the data to match our activity structure
    const places = (response.data.results || []).map((place) => ({
      id: place.place_id,
      title: place.name,
      description: `Popular ${type.replace("_", " ")} in the area`,
      category: "Places",
      subcategory: getPlaceSubcategory(type),
      location: place.vicinity || place.formatted_address,
      address: place.vicinity || place.formatted_address,
      coordinates: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      },
      rating: place.rating || 0,
      review_count: place.user_ratings_total || 0,
      price_level: place.price_level,
      photos: place.photos
        ? place.photos.map(
            (photo) =>
              `${GOOGLE_PLACES_BASE_URL}/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
          )
        : [],
      opening_hours: place.opening_hours?.open_now,
      types: place.types,
      durationMin: getEstimatedDuration(type),
      icon: getPlaceIcon(type),
      color: getPlaceColor(type),
      source: "google_places",
      external_id: place.place_id,
    }));

    res.json({
      places,
      next_page_token: response.data.next_page_token,
      status: response.data.status,
    });
  } catch (error) {
    console.error(
      "Google Places API Error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to fetch popular places",
      details: error.response?.data?.error_message || error.message,
    });
  }
};

// Get movie details by ID
const getMovieDetails = async (req, res) => {
  try {
    const { movieId } = req.params;

    // Check if API key is configured
    if (TMDB_API_KEY === "your_tmdb_api_key_here") {
      return res.status(400).json({
        error: "TMDB API key not configured",
        details: "Please set TMDB_API_KEY in your environment variables",
      });
    }

    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: "en-US",
        append_to_response: "credits,videos,reviews",
      },
    });

    const movie = response.data;

    res.json({
      id: movie.id,
      title: movie.title,
      description: movie.overview,
      release_date: movie.release_date,
      runtime: movie.runtime,
      genres: movie.genres,
      rating: movie.vote_average,
      vote_count: movie.vote_count,
      popularity: movie.popularity,
      budget: movie.budget,
      revenue: movie.revenue,
      poster_path: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      backdrop_path: movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
        : null,
      production_companies: movie.production_companies,
      cast: movie.credits?.cast?.slice(0, 10) || [],
      crew: movie.credits?.crew?.slice(0, 5) || [],
      videos: movie.videos?.results?.slice(0, 3) || [],
      reviews: movie.reviews?.results?.slice(0, 3) || [],
    });
  } catch (error) {
    console.error(
      "TMDB Movie Details Error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to fetch movie details",
      details: error.response?.data?.status_message || error.message,
    });
  }
};

// Helper functions
const getPlaceSubcategory = (type) => {
  const categoryMap = {
    tourist_attraction: "Tourist Attraction",
    restaurant: "Restaurant",
    museum: "Museum",
    park: "Park",
    shopping_mall: "Shopping",
    movie_theater: "Cinema",
    amusement_park: "Amusement Park",
    zoo: "Zoo",
    aquarium: "Aquarium",
    art_gallery: "Art Gallery",
  };
  return categoryMap[type] || "General";
};

const getEstimatedDuration = (type) => {
  const durationMap = {
    tourist_attraction: 120,
    restaurant: 90,
    museum: 150,
    park: 120,
    shopping_mall: 180,
    movie_theater: 150,
    amusement_park: 240,
    zoo: 180,
    aquarium: 120,
    art_gallery: 90,
  };
  return durationMap[type] || 120;
};

const getPlaceIcon = (type) => {
  const iconMap = {
    tourist_attraction: "🏛️",
    restaurant: "🍽️",
    museum: "🏛️",
    park: "🌳",
    shopping_mall: "🛍️",
    movie_theater: "🎬",
    amusement_park: "🎢",
    zoo: "🦁",
    aquarium: "🐠",
    art_gallery: "🎨",
  };
  return iconMap[type] || "📍";
};

const getPlaceColor = (type) => {
  const colorMap = {
    tourist_attraction: "#FF6B6B",
    restaurant: "#4ECDC4",
    museum: "#45B7D1",
    park: "#96CEB4",
    shopping_mall: "#FECA57",
    movie_theater: "#FF9FF3",
    amusement_park: "#54A0FF",
    zoo: "#5F27CD",
    aquarium: "#00D2D3",
    art_gallery: "#FF9FF3",
  };
  return colorMap[type] || "#DDA0DD";
};

module.exports = {
  getTrendingMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  getPopularPlaces,
  getMovieDetails,
};
