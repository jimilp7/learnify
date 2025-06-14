# Learnify - AI Audio Learning Platform

## Overview
Learnify is "Spotify for learning" - an endless stream of short, high-quality AI-generated audio tutorials (3-5 minutes each) tailored to user interests and understanding level.

## Current Implementation Status
**✅ COMPLETED:**
- Topic Selection screen with autoFocus and Learnify branding
- Depth Selection screen with green color variants (Simple/Normal/Advanced)
- Generating Plan loading screen with spinner 
- AI-powered Lesson Plan generation using OpenAI GPT-4
- Mobile-first responsive design with sticky CTAs
- Expandable lesson descriptions
- Comprehensive console logging throughout the app
- API integration with OpenAI for real lesson plan generation

**🚧 TODO (Next Session):**
- Audio generation using Resemble AI
- Audio playback screen/component
- Script generation for individual lessons
- Authentication system
- Local storage persistence

## User Flow (Current)
1. **Topic Selection**: User enters what they want to learn about
   - Large text area with autoFocus
   - Blue focus ring, disabled state handling
2. **Depth Level**: User selects learning depth:
   - Simple (ELI5) - green-400
   - Normal (High School) - green-500  
   - Advanced (PhD/Researcher) - green-600
3. **Generating Plan**: Loading screen with spinner while AI generates lessons
   - Shows topic and depth selection
   - Typically takes 10-30 seconds
4. **Lesson Plan**: AI-generated lessons displayed (10-15 lessons)
   - Each lesson: title, description, duration (3-5 min)
   - Expandable descriptions (2 lines default, click to expand)
   - User reviews plan and clicks "Start Learning"
5. **Audio Generation**: (TODO - Next phase)
6. **Audio Playback**: (TODO - Next phase)

## Technical Stack
- **Framework**: Next.js 15+ with App Router
- **UI**: shadcn-ui (pre-initialized)
- **Icons**: lucide-react
- **Styling**: Tailwind CSS
- **AI Integration**: OpenAI SDK (GPT-4)
- **API**: Next.js API routes (/api/generate-plan)
- **Environment**: .env.local with OPENAI_API_KEY configured
- **Deployment**: Vercel (ready)

## File Structure
```
app/
├── page.tsx           # Main app with screen navigation
├── layout.tsx         # Root layout with Learnify branding
├── globals.css        # Global styles
└── api/
    └── generate-plan/
        └── route.ts   # OpenAI API integration

components/
├── TopicSelection.tsx     # Topic input screen
├── DepthSelection.tsx     # Learning depth selection
├── GeneratingPlan.tsx     # Loading screen with spinner
└── LessonPlan.tsx         # AI-generated lesson display

lib/
└── openai.ts         # OpenAI service integration

.env.local            # Environment variables (API key configured)
```

## Design System
- **Colors**: 
  - Primary CTAs: Blue (blue-500/600)
  - Depth levels: Green variants (green-400/500/600)
  - Focus rings: Blue (blue-200)
- **Typography**: Large fonts for mobile accessibility
- **Layout**: Mobile-first, sticky bottom CTAs
- **Interactions**: Smooth transitions, hover states

## API Integration Details
- **Model**: GPT-4 via OpenAI SDK
- **Endpoint**: POST /api/generate-plan
- **Request**: { topic: string, depth: string }
- **Response**: { lessons: LessonPlanData[] }
- **Error Handling**: User-friendly error messages with retry

## Logging Implementation
Comprehensive console.log statements throughout:
- 🏠 Component lifecycle events
- 🎯 User interactions and navigation
- 🚀 API calls with request/response data
- 🤖 OpenAI integration with token usage
- ⏱️ Performance timing information
- 💥 Error handling with detailed context

## Key Features (Implemented)
- Mobile-optimized responsive design
- Real-time AI lesson plan generation
- Expandable lesson descriptions
- Smooth navigation between screens
- Error handling with user feedback
- Performance monitoring via console logs

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint (if available)

## Project Constraints
- Built for hackathon - keep it simple
- No backend database (local storage only)
- Minimal authentication (not yet implemented)
- Focus on core learning experience first