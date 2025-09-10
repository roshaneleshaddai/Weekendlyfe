# Weekendly - Your Perfect Weekend Planner

A comprehensive web application that helps users plan their perfect weekend with activities, themes, time management, and more. Built with Next.js, React, Node.js, and MongoDB.

## 🌟 Features

### Core Features

- **Activity Management**: Browse and select from 20+ curated activities across multiple categories
- **Time Slot Management**: Advanced time conflict detection and prevention
- **Drag & Drop Interface**: Intuitive drag-and-drop for rearranging activities
- **Theme Support**: Choose from 6 different weekend themes (Lazy, Adventurous, Family, etc.)
- **Mood Tracking**: Assign vibes to each activity (Happy, Relaxed, Energetic, etc.)
- **Notes & Personalization**: Add personal notes to each activity
- **Export Functionality**: Generate and download SVG posters of your weekend plan

### Advanced Features

- **Token-based Authentication**: Secure JWT authentication with persistent login
- **Real-time Conflict Detection**: Prevents overlapping time slots
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern UI/UX**: Beautiful gradient designs with smooth animations
- **Search & Filter**: Find activities by category, duration, or keywords
- **Duration Tracking**: Automatic calculation of total weekend duration
- **Offline Support**: Service worker for basic offline functionality

### Technical Features

- **Component Architecture**: Reusable, well-structured React components
- **State Management**: Context API for authentication and global state
- **Performance Optimized**: SWR for data fetching and caching
- **Accessibility**: Semantic HTML and keyboard navigation support
- **Error Handling**: Comprehensive error handling with user feedback
- **Loading States**: Smooth loading indicators and transitions

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd weekendly
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**

   Create a `.env` file in the backend directory:

   ```env
   MONGODB_URI=mongodb://localhost:27017/weekendly
   JWT_SECRET=your-secret-key-here
   PORT=4000
   ```

   Create a `.env.local` file in the frontend directory:

   ```env
   NEXT_PUBLIC_API_BASE=http://localhost:4000/api
   ```

5. **Start the backend server**

   ```bash
   cd backend
   npm run dev
   ```

6. **Start the frontend development server**

   ```bash
   cd frontend
   npm run dev
   ```

7. **Seed the database** (optional)

   ```bash
   # In a new terminal, navigate to backend directory
   curl http://localhost:4000/api/seed
   ```

8. **Open your browser**
   Navigate to `http://localhost:3000` to see the application.

## 🏗️ Architecture

### Backend (Node.js + Express)

- **Authentication**: JWT-based auth with bcrypt password hashing
- **Database**: MongoDB with Mongoose ODM
- **API Endpoints**: RESTful API with comprehensive error handling
- **Time Management**: Advanced conflict detection algorithms
- **Data Models**: User, Activity, PlanItem schemas with relationships

### Frontend (Next.js + React)

- **Framework**: Next.js 13 with App Router
- **Styling**: Tailwind CSS with custom components
- **Animations**: Framer Motion for smooth transitions
- **State Management**: React Context API and SWR
- **Components**: Modular, reusable component architecture
- **Authentication**: Persistent login with localStorage

### Key Components

- `ActivitiesPanel`: Activity browsing and filtering
- `ScheduleBoard`: Weekend planning interface
- `TimeSlotManager`: Time conflict detection and management
- `AuthContext`: Authentication state management
- `AuthNav`: Navigation with authentication status

## 📱 Usage

1. **Sign Up/Login**: Create an account or sign in
2. **Browse Activities**: Explore activities by category or search
3. **Add to Plan**: Click "Add to Plan" on any activity
4. **Set Times**: Use the time picker to set start times
5. **Choose Vibes**: Select the mood for each activity
6. **Add Notes**: Personalize with your own notes
7. **Drag & Drop**: Rearrange activities between days
8. **Save Plan**: Save your weekend plan
9. **Export**: Download a beautiful poster of your plan

## 🎨 Design System

### Color Palette

- **Primary**: Purple to Blue gradients
- **Secondary**: Emerald to Green gradients
- **Accent**: Various category-specific colors
- **Neutral**: Gray scale for text and backgrounds

### Typography

- **Font**: Inter (system font fallback)
- **Headings**: Bold, gradient text
- **Body**: Clean, readable text

### Components

- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Gradient backgrounds with hover effects
- **Inputs**: Clean borders with focus states
- **Animations**: Smooth transitions and micro-interactions

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Activities

- `GET /api/activities` - Get all activities
- `POST /api/activities` - Create new activity (authenticated)

### Planning

- `GET /api/plan` - Get user's weekend plan (authenticated)
- `POST /api/plan` - Save weekend plan (authenticated)
- `DELETE /api/plan/:id` - Remove plan item (authenticated)

### Themes & Vibes

- `GET /api/themes` - Get available themes
- `GET /api/vibes` - Get available vibes

### Utilities

- `GET /api/export` - Export plan as SVG (authenticated)
- `GET /api/seed` - Seed database with sample data

## 🧪 Testing

The application includes basic error handling and validation. For production use, consider adding:

- Unit tests for components
- Integration tests for API endpoints
- End-to-end tests for user flows
- Performance testing for large datasets

## 🚀 Deployment

### Backend Deployment

1. Deploy to platforms like Heroku, Railway, or DigitalOcean
2. Set up MongoDB Atlas for production database
3. Configure environment variables
4. Set up CORS for your frontend domain

### Frontend Deployment

1. Deploy to Vercel, Netlify, or similar
2. Configure environment variables
3. Set up custom domain (optional)

### Docker Deployment

Both frontend and backend include Dockerfile for containerized deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Unsplash for beautiful activity images
- Tailwind CSS for the design system
- Framer Motion for smooth animations
- Next.js team for the amazing framework

---

**Weekendly** - Making every weekend memorable! 🎉
