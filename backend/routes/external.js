const express = require("express");
const router = express.Router();
const {
  getTrendingMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  getPopularPlaces,
  getMovieDetails,
} = require("../controllers/externalApiController");

// Movie endpoints
router.get("/movies/trending", getTrendingMovies);
router.get("/movies/now-playing", getNowPlayingMovies);
router.get("/movies/upcoming", getUpcomingMovies);
router.get("/movies/:movieId", getMovieDetails);

// Places endpoints
router.get("/places/popular", getPopularPlaces);

module.exports = router;
