# Learnify - AI Audio Learning Platform

Learnify is "Spotify for learning" - an endless stream of short, high-quality AI-generated audio tutorials (3-5 minutes each) tailored to user interests and understanding level. The platform generates personalized lesson plans using OpenAI GPT-4 and converts them to audio using Resemble AI text-to-speech technology.

## Project Structure

```
learnify/
├── app/                               # Next.js 15+ App Router application
│   ├── layout.tsx                    # Root layout with Learnify branding
│   ├── page.tsx                      # Main app with screen-based navigation state machine
│   ├── globals.css                   # Tailwind CSS v4 + shadcn-ui styling configuration
│   ├── favicon.ico                   # App icon
│   └── api/                          # Backend API routes
│       ├── generate-plan/
│       │   └── route.ts             # OpenAI lesson plan generation endpoint
│       ├── generate-content/
│       │   └── route.ts             # Individual lesson content generation
│       ├── generate-lesson-audio/
│       │   └── route.ts             # Audio synthesis endpoint
│       └── backend/
│           ├── tts.ts               # Resemble AI TTS service class
│           ├── ttsTest.ts           # TTS testing utilities
│           └── playground.ts        # TTS testing playground
├── components/                        # UI components for each app screen
│   ├── TopicSelection.tsx           # Topic input screen with autoFocus
│   ├── DepthSelection.tsx           # Learning depth selection (Simple/Normal/Advanced)
│   ├── GeneratingPlan.tsx           # Loading screen with spinner during AI generation
│   ├── LessonPlan.tsx               # AI-generated lesson plan display with expandable descriptions
│   ├── GeneratingContent.tsx        # Loading screen for lesson content generation
│   ├── LessonContent.tsx            # Main learning interface with audio generation
│   ├── AudioPlayer.tsx              # Fixed bottom audio controls with playlist
│   └── ui/                          # shadcn-ui component library
│       ├── button.tsx               # CVA-based button variants
│       ├── card.tsx                 # Modular card system
│       ├── input.tsx                # Form input controls
│       ├── label.tsx                # Form labels with accessibility
│       ├── radio-group.tsx          # Radix UI radio button groups
│       ├── scroll-area.tsx          # Custom scrollable areas
│       └── textarea.tsx             # Multi-line text input
├── lib/                               # Core services and utilities
│   ├── openai.ts                    # OpenAI service integration (GPT-4/o3-mini)
│   ├── constants.ts                 # Application configuration constants
│   └── utils.ts                     # Tailwind CSS utility functions (cn)
├── public/                            # Static assets
│   ├── file.svg                     # Icon assets
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── .env.local                         # Environment variables (OPENAI_API_KEY, RESEMBLE_API_KEY)
├── components.json                    # shadcn-ui configuration
├── eslint.config.mjs                 # ESLint configuration with Next.js rules
├── middleware.ts                     # HTTP basic auth middleware (learnify/agihouse)
├── next.config.ts                    # Next.js configuration (minimal/default)
├── package.json                      # Dependencies and scripts
├── postcss.config.mjs                # PostCSS configuration for Tailwind
├── README.md                         # Project overview
└── tsconfig.json                     # TypeScript configuration (strict mode)
```

## Build & Commands

- **Development server**: `npm run dev` (with Turbopack enabled for faster builds)
- **Production build**: `npm run build`
- **Production server**: `npm run start`
- **Linting**: `npm run lint` (ESLint with Next.js rules)

### Development Environment

- **Frontend dev server**: http://localhost:3000
- **Basic auth**: Username `learnify`, Password `agihouse`
- **API endpoints**: `/api/generate-plan`, `/api/generate-content`, `/api/generate-lesson-audio`

## Code Style

- **TypeScript**: Strict mode enabled with comprehensive type checking
- **Target**: ES2017 with modern module resolution (bundler)
- **Imports**: Path aliases using `@/*` mapping to project root
- **Styling**: Double quotes for strings, no explicit semicolons due to Next.js defaults
- **Functions**: Arrow functions preferred for components and callbacks
- **Interfaces**: Used for component props and data structures
- **Logging**: Extensive console.log statements with emoji prefixes for debugging:
  - 🏠 Component lifecycle events
  - 🎯 User interactions and navigation
  - 🚀 API calls with request/response data
  - 🤖 OpenAI integration with token usage
  - ⏱️ Performance timing information
  - 💥 Error handling with detailed context
- **Error Handling**: Comprehensive try-catch blocks with user-friendly error messages
- **Comments**: Minimal commenting, code is self-documenting with descriptive variable names

## Testing

- **Framework**: No testing framework currently configured
- **Testing Approach**: Console logging for debugging and monitoring
- **API Testing**: Manual testing with playground files (`ttsTest.ts`, `playground.ts`)

## Architecture

### Frontend Stack
- **Framework**: Next.js 15.3.3 with App Router
- **React**: v19.0.0 with concurrent features
- **UI Library**: shadcn-ui components built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with OKLCH color space and dark mode support
- **Icons**: Lucide React v0.515.0
- **State Management**: React useState for screen-based navigation
- **TypeScript**: v5 with strict mode and comprehensive type safety

### Backend Stack
- **API Routes**: Next.js API routes with TypeScript
- **AI Integration**: 
  - OpenAI SDK v5.3.0 for GPT-4/o3-mini lesson generation
  - Resemble AI Node SDK v3.4.2 for text-to-speech synthesis
- **HTTP Client**: Axios v1.10.0 for external API requests
- **Environment**: dotenv v16.5.0 for configuration management

### Key Features
- **Screen-Based Navigation**: Single-page app with state machine pattern
- **Real-Time Audio Streaming**: Paragraph-by-paragraph audio generation with blob URLs
- **Responsive Design**: Mobile-first approach with sticky bottom CTAs
- **AI-Powered Content**: Dynamic lesson plan and content generation
- **Audio Management**: URL cleanup and memory management for performance
- **Error Boundaries**: Comprehensive error handling with retry mechanisms

## Security

- **Authentication**: HTTP Basic Auth middleware protecting all routes
- **Environment Variables**: Sensitive API keys stored in .env.local
- **Input Validation**: Server-side validation for all API endpoints
- **HTTPS**: Enforced in production (Vercel deployment)
- **No Secrets in Code**: All API keys and sensitive data externalized

## Git Workflow

- **Main Branch**: `main` (for production deployments)
- **Development**: Feature branches merged via pull requests
- **Commits**: Descriptive commit messages following conventional patterns
- **Recent Changes**: Focus on auth implementation and full flow completion

## Configuration

### Environment Variables (.env.local)
```
OPENAI_API_KEY=your_openai_api_key
RESEMBLE_API_KEY=your_resemble_api_key
```

### Key Configuration Files
- **components.json**: shadcn-ui setup with "new-york" style variant
- **tsconfig.json**: Strict TypeScript with path aliases and Next.js plugin
- **eslint.config.mjs**: Next.js core-web-vitals and TypeScript rules
- **tailwind via globals.css**: Custom CSS properties with dark mode support

### Application Constants (lib/constants.ts)
```typescript
export const MIN_LESSONS = 3
export const MAX_LESSONS = 5
export const MIN_LESSON_LENGTH = 60  // 1 minute in seconds
export const MAX_LESSON_LENGTH = 120 // 2 minutes in seconds
```

### Data Structures
```typescript
type Screen = "topic" | "depth" | "generating" | "plan" | "generatingContent" | "player"

interface Lesson {
  id: string
  title: string
  description: string
  duration: number // in minutes
}

interface LessonPlanData {
  id: string
  title: string
  description: string
  duration: number
}
```

## User Flow

1. **Topic Selection**: User enters learning topic (autoFocus text area)
2. **Depth Selection**: Choose difficulty level (Simple/Normal/Advanced) with green color variants
3. **Generating Plan**: AI generates 3-5 lessons using OpenAI GPT-4 (10-30 seconds)
4. **Lesson Plan Review**: Display generated lessons with expandable descriptions
5. **Content Generation**: Generate detailed script for selected lesson
6. **Audio Playback**: Stream audio with navigation controls and playlist management

## Development Notes

- **Hackathon Project**: Keep implementation simple and focused
- **No Database**: Uses local storage for state persistence
- **Mobile-First**: Optimized for mobile learning experience
- **AI-Centric**: Core functionality relies on OpenAI and Resemble AI services
- **Performance**: Turbopack enabled for fast development builds
- **Deployment**: Vercel-ready with zero configuration