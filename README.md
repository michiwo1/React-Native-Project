# Fitness Tracking App

## Overview

A comprehensive fitness application that integrates workout logging and nutrition management. The app supports efficient training by visualizing workout progress and providing personalized AI-powered advice.

## Tech Stack

### Frontend (Expo/React Native)

- **Expo**: App build and deployment management
- **Redux Toolkit**: Global state management
- **React Native Paper**: UI component library
- **react-native-charts-wrapper**: Training progress visualization 
- **react-native-notifications**: Push notification functionality

### Backend (Express.js/Vercel)

- **Express.js**: API server
- **Prisma**: PostgreSQL database ORM
- **JWT**: Authentication
- **Google Gemini**: AI features (Training plan generation)
- **Jest**: Unit testing
- **PostgreSQL**: Database
- **Vercel**: Backend deployment

## Key Features

### Workout Management
- Personalized training plan creation
- Workout logging
- Progress visualization with charts
- Personal record tracking
- Interval timer

### Nutrition Management
- Meal logging
- Nutrition balance analysis  
- Calorie & macro nutrient goal setting
- Automatic nutrition calculation from meal photos (AI)

### AI Features
- Training advice generation
- Form analysis
- Nutrition advice generation
- Food image analysis: Automatically calculates nutritional content from food photos
  - Calorie estimation
  - Macro nutrients calculation (protein, carbs, fat)

## Testing

### Unit Tests (Jest)
```bash
cd server
npm test
```

Implemented test cases for major service classes:
- AuthService
- UserService  
- WorkoutService
- ExerciseService
- MealService
- PlanService

## Setup

### Prerequisites
- Node.js v18 or higher
- PostgreSQL
- Expo CLI

### Frontend
```bash
# Clone project
git clone [repository-url]

# Install dependencies  
npm install

# Start development server
npx expo start
```

### Backend
```bash
cd server

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env file with required variables

# Run database migrations
npx prisma migrate dev

# Seed initial data
npx prisma db seed

# Start development server
npm run dev
```

### Environment Variables
```
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
```

## License

MIT
