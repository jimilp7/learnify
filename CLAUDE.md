# Learnify - AI Audio Learning Platform

## Overview
Learnify is "Spotify for learning" - an endless stream of short, high-quality AI-generated audio tutorials (3-5 minutes each) tailored to user interests and understanding level.

## User Flow
1. **Topic Selection**: User enters what they want to learn about
2. **Depth Level**: User selects learning depth:
   - Simple (ELI5)
   - Normal (High School)
   - Advanced (PhD/Researcher)
3. **Lesson Plan**: AI generates up to 15 lessons using OpenAI o3 model
   - Each lesson includes: title, description, duration (3-5 min)
   - User reviews plan and clicks "Start"
4. **Content Generation**: Full scripts generated using OpenAI o3
5. **Audio Playback**: Audio generated and played using Resemble AI

## Technical Stack
- **Framework**: Next.js
- **UI**: shadcn-ui
- **Deployment**: Vercel
- **Authentication**: Basic HTTP auth (username/password)
- **Storage**: Local storage only (no backend database)
- **AI Models**: 
  - OpenAI o3 (lesson planning & script generation)
  - Resemble AI (text-to-speech)

## Key Features
- Interactive learning - pause and change direction anytime
- No user accounts - simple auth
- All data stored locally
- Option to reset/nuke everything

## Project Constraints
- Built for hackathon - keep it simple
- No backend database
- Minimal authentication