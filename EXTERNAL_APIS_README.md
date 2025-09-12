# External APIs Integration

This update adds popular places and new movie releases to the weekend planning app using external APIs.

## Features Added

### 🎬 Movies Integration

- **Trending Movies**: Popular movies of the week/day
- **Now Playing**: Movies currently in theaters
- **Upcoming Movies**: Movies releasing soon
- **Movie Details**: Full information including cast, crew, trailers, reviews
- **Auto-scheduling**: Movies default to evening time slots

### 📍 Places Integration

- **Popular Places**: Tourist attractions, restaurants, museums, parks, etc.
- **Location-based**: Uses user's location or defaults to Delhi
- **Multiple Sources**: Google Places API and Foursquare API
- **Filtering**: Filter by place type, radius, and data source
- **Rich Information**: Ratings, reviews, photos, opening hours, price levels

## API Keys Required

### TMDB API (Movies)

1. Go to https://www.themoviedb.org/settings/api
2. Create an account and request API access
3. Add your API key to backend/.env as `TMDB_API_KEY=your_key_here`

### Google Places API (Places)

1. Go to https://console.cloud.google.com/
2. Create a project and enable Places API
3. Create credentials (API key)
4. Add to backend/.env as `GOOGLE_PLACES_API_KEY=your_key_here`

### Foursquare API (Places - Fallback)

1. Go to https://developer.foursquare.com/
2. Create an app and get API key
3. Add to backend/.env as `FOURSQUARE_API_KEY=your_key_here`

## Backend Endpoints

### Movies

- `GET /api/external/movies/trending` - Get trending movies
- `GET /api/external/movies/now-playing` - Get movies in theaters
- `GET /api/external/movies/upcoming` - Get upcoming movies
- `GET /api/external/movies/:movieId` - Get movie details

### Places

- `GET /api/external/places/popular` - Get popular places (Google)
- `GET /api/external/places/trending` - Get trending places (Foursquare)

## Frontend Components

### MoviesPanel.js

- Tabbed interface for different movie categories
- Movie cards with posters, ratings, release dates
- Add to weekend functionality with time selection
- Infinite scrolling/pagination

### PlacesPanel.js

- Switch between Google Places and Foursquare data
- Filter by place type (attractions, restaurants, etc.)
- Radius-based search
- Location-aware (uses user's GPS or defaults to Delhi)

### Integration

- New tab system in main page
- Activities, Movies, and Places tabs
- Unified "Add to Weekend" functionality
- All items can be dragged to schedule board

## Usage

1. **Setup APIs**: Add API keys to backend/.env
2. **Start Backend**: `cd backend && npm start`
3. **Start Frontend**: `cd frontend && npm run dev`
4. **Use App**:
   - Click Movies tab to browse trending/now playing/upcoming movies
   - Click Places tab to discover popular places near you
   - Add items to your weekend plan with custom times
   - Save and manage your weekend schedule

## Features

- **Location Services**: App requests location permission for better place recommendations
- **Error Handling**: Graceful fallbacks when APIs are unavailable
- **Responsive Design**: Works on desktop and mobile
- **Real-time Data**: Fresh movie and place data from external sources
- **Smart Defaults**: Movies default to evening, places to morning/afternoon
- **Rich Metadata**: Posters, ratings, reviews, photos, and more

## Notes

- TMDB API is free with generous rate limits
- Google Places API has free tier with usage limits
- Foursquare API provides alternative place data
- Location defaults to Delhi, India if GPS unavailable
- All external data is transformed to match app's activity structure
