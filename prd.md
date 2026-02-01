Overview

Landmarks is a mobile app that enables users to share images and mapped locations of their favorite Indian national parks to a public social feed. The app promotes discovery, community, and nature appreciation through user-generated content.

Goals

Allow users to easily create and share posts with photos and location data.

Enable social interaction via likes and comments.

Build a visually appealing, intuitive interface that encourages exploration.

Offer optional premium features using RevenueCat.

Gather user feedback using Loops.

Provide AI-powered enhancements (e.g., smart tagging or image suggestions) via Ollama local ai llm.

Tech Stack

Frontend: React Native (Expo managed workflow)

Backend & Auth: Supabase

Monetization: RevenueCat

User Feedback: Loops

AI Features: Ollamma local llm ai model -  llama3.1:latest

Core Screens
1. Onboarding (x3)

Slide 1: Welcome and value proposition

Slide 2: Key features (Post, Explore, Interact)

Slide 3: Permissions (location, notifications, camera access)

2. Login / Signup

Email/password and OAuth options via Supabase

Error validation and account recovery

3. User Settings

Edit profile (username, bio, profile pic)

Notification settings

Manage subscription (via RevenueCat)

Logout

4. Feed

Scrollable list of recent or trending posts

Each post displays: image, park name, user info, timestamp, likes, comments count

Tappable to open full post

5. User Profile

Public view of a user’s posts and bio

Private view includes option to edit or delete posts

6. Create Post

Upload image

Add park location (via map or park search)

Optional caption

Submit button

ollama local model ai can offer tag suggestions or auto-location based on image (future scope)

7. View Post

Full-screen post with image, location, caption

Comments thread

Like button

Key Features

Post Creation: Upload photo, set park location, add caption

Image Upload: Via camera or gallery

Location Mapping: Use device GPS and map UI to pin national park

Commenting: Threaded replies under each post

Liking: Tap to like posts

Stretch Goals / Future Scope

AI-based location or park detection from images

Saved parks or wishlist

Hashtags and tagging

Nearby parks discovery

Offline draft saving

Non-Functional Requirements

Smooth offline/online handling

Fast image loading and caching

Secure user data handling via Supabase Auth and RLS

Performance optimized for Expo



