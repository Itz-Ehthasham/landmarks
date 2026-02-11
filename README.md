# Landmarks

**A Social Platform for India's National Parks**

---

## 🚀 CI/CD Pipeline

This project implements a comprehensive Jenkins CI/CD pipeline with automated code quality checks through SonarQube integration. The pipeline ensures code quality, runs automated tests, and maintains high development standards.

### Pipeline Architecture

The CI/CD pipeline consists of the following stages executed sequentially:

1. **Checkout SCM** - Retrieves the latest source code from the version control system
2. **Tool Install** - Installs required Node.js tools and dependencies
3. **Install** - Runs npm install to download all project dependencies
4. **Lint** - Performs code linting using ESLint to enforce code style standards
5. **TypeCheck** - Validates TypeScript types to catch type-related errors
6. **Test** - Executes automated test suites to verify functionality
7. **SonarQube Analysis** - Performs comprehensive code quality and security analysis
8. **Post Actions** - Cleanup tasks including workspace deletion upon build completion

### SonarQube Integration

The pipeline includes SonarQube for automated code quality analysis, providing insights into:

- Code coverage and test quality
- Security vulnerabilities and code smells
- Code duplication and complexity metrics
- Technical debt assessment
- Maintainability ratings and quality gates

### Pipeline Benefits

- **Automated Quality Checks** - Every code change is automatically validated against quality standards
- **Early Bug Detection** - Issues are caught during the build process before deployment
- **Consistent Standards** - Enforces coding standards and best practices across the team
- **Fast Feedback Loop** - Developers receive immediate feedback on code quality
- **Clean Workspace** - Automated cleanup ensures optimal resource utilization

---

## 📱 Project Overview

Landmarks is a React Native social platform that enables users to discover, share, and explore images and mapped locations of India's most beautiful national parks through an engaging social feed. Users can share photos of landmarks, tag locations using GPS integration, and connect with a community of nature enthusiasts.

### Core Capabilities

- 📸 **Share Photos** - Upload and share beautiful images of landmarks and national parks
- 📍 **Location Tagging** - Pin exact locations using device GPS and interactive maps
- 💬 **Community Engagement** - Like posts and participate in threaded discussions
- 👤 **User Profiles** - Create personalized profiles and discover other explorers
- 🔐 **Secure Authentication** - Email/password login and OAuth integration via Supabase

---

## ✨ Key Features

- **Post Creation** - Upload photos, set park locations, and add captions to share your experiences
- **Image Management** - Choose images from camera or photo gallery with Expo Image Picker
- **Location Mapping** - Use device GPS and interactive map UI to pin national park locations
- **Social Interaction** - Like posts and engage in threaded comment discussions
- **User Profiles** - View public profiles with user posts and bio information
- **Authentication** - Secure user registration and login powered by Supabase
- **Onboarding** - Welcome screens with feature introduction and permissions management
- **Premium Features** - Subscription management via RevenueCat (future scope)
- **AI-Powered Suggestions** - Smart tagging using Ollama (llama3.1:latest) for enhanced user experience

---

## 🛠 Technology Stack

| Layer                | Technology                                     |
| -------------------- | ---------------------------------------------- |
| **Frontend**         | React Native with Expo managed workflow        |
| **Backend & Auth**   | Supabase (PostgreSQL, Authentication, Storage) |
| **Database**         | PostgreSQL via Supabase                        |
| **Navigation**       | Expo Router                                    |
| **State Management** | React Context API                              |
| **Local Storage**    | AsyncStorage, Expo SQLite                      |
| **Image Handling**   | Expo Image Picker, Expo Image                  |
| **CI/CD**            | Jenkins with SonarQube integration             |
| **Code Quality**     | ESLint, TypeScript, SonarQube                  |
| **Monetization**     | RevenueCat (planned)                           |
| **Analytics**        | Loops                                          |
| **AI Features**      | Ollama (llama3.1:latest)                       |

---

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

---

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn installed
- Expo CLI: `npm install -g expo-cli`
- Supabase account and project configured
- Android Studio (Android) or Xcode (iOS) for mobile development
- Jenkins server with SonarQube integration for CI/CD

### Installation Steps

1. **Clone the repository**

```bash
git clone <repository-url>
cd landmarks
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

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

---

## 📋 Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run on web browser
- `npm run lint` - Run ESLint code linting
- `npm run typecheck` - Run TypeScript type checking
- `npm run reset-project` - Reset project to initial state

---

## 🏗 Core Screens

### 1. Onboarding (3 slides)

- Welcome and value proposition
- Feature overview (Post, Explore, Interact)
- Permissions request (location, camera, notifications)

### 2. Authentication

- Login screen with email/password
- Sign up screen for new users
- Account recovery options

### 3. Home Feed

- Scrollable list of recent/trending posts
- Post cards with images, park names, user info, timestamps
- Like and comment counts
- Tap to view full post details

### 4. Create Post

- Image upload from camera or gallery
- Park location selection via map or search
- Caption input
- Submit functionality

### 5. Post Details

- Full-screen post view with image and location
- Comment thread display
- Like functionality
- User info and timestamp

### 6. User Profile

- Public profile view with user's posts and bio
- Private profile with edit and delete options
- Profile picture and username
- Bio information

### 7. Settings

- Profile editing (username, bio, avatar)
- Notification preferences
- Subscription management (RevenueCat)
- Logout functionality

---

## 🔐 Authentication Flow

The application uses Supabase for secure authentication with the following flow:

1. **Onboarding Check** - Verifies if user has completed the onboarding process
2. **Session Verification** - Checks for existing authenticated session in AsyncStorage
3. **Route Navigation**:
   - No user → Show onboarding (if not completed) or login
   - Authenticated user → Navigate to home feed

---

## 📦 Database Schema

The database is managed through Supabase migrations located in `supabase/migrations/`. Key tables include:

- **profiles** - User profile information including bio, avatar, and username
- **posts** - User posts with images, captions, and location data
- **comments** - Post comments and threaded discussions
- **likes** - Post likes tracking for engagement metrics

---

## 🎯 Future Enhancements

- **AI-Powered Suggestions** - Smart tagging and auto-location detection using Ollama
- **Premium Subscription** - Revenue generation via RevenueCat integration
- **Analytics Dashboard** - User engagement tracking with Loops analytics
- **Real-time Notifications** - Push notifications for likes, comments, and follows
- **Advanced Search** - Filter posts by park, date, user, or trending topics

---

## 🐛 Development Best Practices

- Run `npm run typecheck` regularly to catch TypeScript errors early
- Execute `npm run lint` to maintain consistent code quality and style
- Utilize AsyncStorage for persistent local state management
- Leverage React Context API for efficient global state management
- Verify `.env.local` contains proper Supabase credentials before starting
- Monitor Jenkins pipeline for automated quality feedback after commits

---

## 📱 Supported Platforms

- iOS 13.0 and above
- Android 5.0 (API Level 21) and above
- Modern web browsers (Chrome, Firefox, Safari, Edge)

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 👤 Author

**Ehthasham** - Project Lead

---

## 🤝 Contributing

This is a private project. For contribution guidelines, please contact the project maintainer.

---

## 📞 Support

For issues, questions, or feature requests, please refer to the project documentation or contact the development team.
