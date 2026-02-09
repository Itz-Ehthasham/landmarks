# Landmarks

A mobile app that enables users to discover, share, and explore images and mapped locations of India's most beautiful national parks through a social feed. scrolling available

## 📱 Overview

**Landmarks** is a React Native social platform dedicated to celebrating Indian national parks. Users can:

- 📸 Share photos of landmarks and national parks
- 📍 Tag locations using GPS and map integration
- 💬 Engage with the community through likes and comments
- 👤 Create personalized profiles and discover other explorers
- 🔐 Secure authentication with email/password and OAuth

## ✨ Key Features

- **Post Creation** - Upload photos, set park locations, and add captions
- **Image Management** - Choose images from camera or gallery
- **Location Mapping** - Use device GPS and interactive map UI to pin national parks
- **Social Interaction** - Like posts and engage in threaded discussions via comments
- **User Profiles** - View public profiles with user posts and bio information
- **Authentication** - Secure user registration and login via Supabase
- **Onboarding** - Welcome screens with feature introduction and permissions management
- **Premium Features** - Support for subscription management via RevenueCat (future scope)

## 🛠 Tech Stack

| Layer                | Technology                                     |
| -------------------- | ---------------------------------------------- |
| **Frontend**         | React Native with Expo managed workflow        |
| **Backend & Auth**   | Supabase (PostgreSQL, Auth, Storage)           |
| **Database**         | PostgreSQL via Supabase                        |
| **Navigation**       | Expo Router                                    |
| **State Management** | React Context API                              |
| **Local Storage**    | AsyncStorage, Expo SQLite                      |
| **Image Handling**   | Expo Image Picker, Expo Image                  |
| **Monetization**     | RevenueCat (future scope)                      |
| **Analytics**        | Loops                                          |
| **AI Features**      | Ollama (llama3.1:latest) for smart suggestions |

## 📂 Project Structure

```
landmarks/
├── app/                           # Application screens and routes
│   ├── _layout.tsx               # Root layout provider
│   ├── index.tsx                 # Entry point with navigation logic
│   ├── onboarding.tsx            # Onboarding flow
│   ├── profile_edit.tsx          # Profile editing screen
│   ├── (tabs)/                   # Tab-based navigation
│   │   ├── _layout.tsx           # Tab layout
│   │   ├── home.tsx              # Feed screen
│   │   ├── post.tsx              # Create post screen
│   │   ├── profile.tsx           # User profile view
│   │   └── settings.tsx          # Settings screen
│   ├── auth/                     # Authentication screens
│   │   ├── login.tsx             # Login screen
│   │   └── signup.tsx            # Sign up screen
│   └── profile/                  # Dynamic profile routes
│       └── [userId].tsx          # User profile detail page
├── assets/                        # Static assets
│   ├── images/                   # App icons and splash screens
│   └── onboarding/               # Onboarding images
├── components/                    # Reusable React components
│   ├── CommentSheet.tsx          # Comment thread component
│   ├── PostCard.tsx              # Post card component
│   └── ...
├── contexts/                      # React Context providers
│   └── AuthContext.tsx           # Authentication state management
├── lib/                           # Utility functions and services
│   ├── supabase.ts               # Supabase client initialization
│   ├── postsData.ts              # Posts API functions
│   ├── profile.ts                # Profile API functions
│   └── onboardingStorage.ts      # Onboarding state persistence
├── supabase/                      # Database configuration
│   └── migrations/               # SQL migrations
└── package.json                   # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Expo CLI installed globally: `npm install -g expo-cli`
- Supabase account and project set up
- Android Studio (for Android development) or Xcode (for iOS)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd landmarks
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the project root:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
   EXPO_PUBLIC_SUPABASE_KEY=<your-supabase-anon-key>
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

### Running on Different Platforms

```bash
# Web
npm run web

# iOS
npm run ios

# Android
npm run android
```

## 📋 Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run app on Android emulator/device
- `npm run ios` - Run app on iOS simulator/device
- `npm run web` - Run app on web browser
- `npm run lint` - Run ESLint code linting
- `npm run typecheck` - Run TypeScript type checking
- `npm run reset-project` - Reset project to initial state

## 🏗 Core Screens

### 1. **Onboarding** (3 slides)

- Welcome and value proposition
- Feature overview (Post, Explore, Interact)
- Permissions request (location, camera, notifications)

### 2. **Authentication**

- Login screen with email/password
- Sign up screen for new users
- Account recovery options

### 3. **Home Feed**

- Scrollable list of recent/trending posts
- Post cards with images, park names, user info, timestamps
- Like and comment counts
- Tap to view full post details

### 4. **Create Post**

- Image upload from camera or gallery
- Park location selection via map or search
- Caption input
- Submit functionality

### 5. **Post Details**

- Full-screen post view with image and location
- Comment thread display
- Like functionality
- User info and timestamp

### 6. **User Profile**

- Public profile view with user's posts and bio
- Private profile with edit and delete options
- Profile picture and username
- Bio information

### 7. **Settings**

- Profile editing (username, bio, avatar)
- Notification preferences
- Subscription management (RevenueCat)
- Logout functionality

## 🔐 Authentication Flow

The app uses Supabase for authentication:

1. **Onboarding Check** - App checks if user has completed onboarding
2. **Session Verification** - Checks for existing authenticated session
3. **Route Navigation**:
   - No user → Show onboarding (if not completed) or login
   - Authenticated user → Navigate to home feed

## 📦 Database Schema

The database is managed through Supabase migrations located in `supabase/migrations/`. Key tables include:

- `profiles` - User profile information
- `posts` - User posts with images and locations
- `comments` - Post comments and discussions
- `likes` - Post likes tracking

## 🎯 Future Features

- **AI-Powered Suggestions** - Smart tagging and auto-location detection using Ollama
- **Premium Subscription** - Revenue generation via RevenueCat
- **Analytics** - User engagement tracking with Loops
- **Real-time Notifications** - Push notifications for likes and comments
- **Advanced Search** - Filter posts by park, date, or user

## 🐛 Development Tips

- Use `npm run typecheck` regularly to catch TypeScript errors
- Run `npm run lint` to maintain code quality
- Use AsyncStorage for persistent local state
- Leverage React Context for global state management
- Check `.env.local` for proper Supabase credentials

## 📱 Supported Platforms

- iOS (13+)
- Android (5.0+)
- Web browsers

## 📄 License

This project is proprietary software. All rights reserved.

## 👤 Author

Ehthasham - Project Lead

## 🤝 Contributing

This is a private project. For contribution guidelines, please contact the project maintainer.

## 📞 Support

For issues, questions, or feature requests, please refer to the project documentation or contact the development team.
