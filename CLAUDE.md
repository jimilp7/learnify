# Learnify - AI Audio Learning Platform

Learnify is "Spotify for learning" - an endless stream of short, high-quality AI-generated audio tutorials (3-5 minutes each) tailored to user interests and understanding level. Built with Next.js 15, OpenAI API, and Resemble AI for text-to-speech generation.

## Project Structure

```
learnify/
├── app/                           # Next.js App Router structure
│   ├── page.tsx                  # Main application controller with screen navigation
│   ├── layout.tsx                # Root layout with Learnify branding
│   ├── globals.css               # Global styles with Tailwind CSS v4 and theme system
│   ├── favicon.ico               # Application favicon
│   └── api/                      # Next.js API routes
│       ├── generate-plan/        # OpenAI lesson plan generation
│       │   └── route.ts          # POST endpoint for AI lesson planning
│       ├── generate-content/     # Individual lesson content generation
│       │   └── route.ts          # POST endpoint for detailed lesson scripts
│       ├── generate-lesson-audio/ # Audio generation from text
│       │   └── route.ts          # POST endpoint with streaming TTS response
│       └── backend/              # Backend utilities and services
│           ├── tts.ts            # Resemble AI TTS service wrapper
│           ├── ttsTest.ts        # TTS testing utilities
│           └── playground.ts     # Development testing playground
├── components/                    # React component library
│   ├── TopicSelection.tsx        # Topic input screen with auto-focus
│   ├── DepthSelection.tsx        # Learning depth selection (Simple/Normal/Advanced)
│   ├── GeneratingPlan.tsx        # Loading screen with spinner for AI generation
│   ├── LessonPlan.tsx           # AI-generated lesson display with expandable descriptions
│   ├── GeneratingContent.tsx     # Content generation loading state
│   ├── LessonContent.tsx        # Individual lesson display with audio player
│   ├── AudioPlayer.tsx          # HTML5 audio player with controls
│   └── ui/                      # shadcn-ui component library (new-york style)
│       ├── button.tsx           # Button component with CVA variants
│       ├── card.tsx             # Card components (Header, Content, Footer, etc.)
│       ├── input.tsx            # Styled input component
│       ├── label.tsx            # Form label component
│       ├── radio-group.tsx      # Radio button group component
│       ├── scroll-area.tsx      # Scrollable area component
│       └── textarea.tsx         # Styled textarea component
├── lib/                          # Shared utilities and services
│   ├── openai.ts                # OpenAI API integration (GPT-4 lesson generation)
│   ├── constants.ts             # Application constants (lesson limits, durations)
│   └── utils.ts                 # Utility functions (cn, clsx, tailwind-merge)
├── public/                       # Static assets
│   ├── file.svg                 # SVG icons
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── components.json               # shadcn-ui configuration (new-york style, neutral base)
├── next.config.ts               # Next.js configuration (minimal/default)
├── tsconfig.json                # TypeScript configuration (strict mode, ES2017)
├── eslint.config.mjs            # ESLint v9 flat config with Next.js rules
├── postcss.config.mjs           # PostCSS with Tailwind CSS v4 plugin
├── package.json                 # Dependencies and scripts
├── package-lock.json            # Dependency lock file
├── .env.local                   # Environment variables (API keys)
└── README.md                    # Project overview
```

## Build & Commands

- Start development server: `npm run dev` (uses Turbopack for faster builds)
- Build for production: `npm run build`
- Start production server: `npm start`
- Run linting: `npm run lint`

### Development Environment

- Development server: http://localhost:3000 (Next.js with Turbopack)
- API routes: http://localhost:3000/api/*
- No database (local storage/state only for hackathon simplicity)
- Real-time AI generation via OpenAI and Resemble AI APIs

## Code Style

- **TypeScript**: Strict mode enabled with ES2017 target
- **Formatting**: Follows Next.js/React conventions with ESLint v9
- **Import Style**: Absolute imports using `@/` path alias (maps to root)
- **Component Pattern**: Functional components with TypeScript interfaces
- **Styling**: Tailwind CSS v4 utility classes with CSS variables
- **File Naming**: PascalCase for components, camelCase for utilities
- **Props Interfaces**: All components define `ComponentNameProps` interfaces
- **Console Logging**: Comprehensive logging throughout (120+ log statements for debugging)

### Component Conventions

- Use controlled components for form inputs
- Props drilling for state management (no external state library)
- Callback props for parent-child communication (`onNext`, `onBack`)
- Conditional rendering for screen navigation
- Error handling passed as optional props

### Styling Conventions

- Mobile-first responsive design with Tailwind utilities
- Consistent spacing patterns (`p-6`, `rounded-2xl`)
- Color system: Blue primary (blue-500/600), Green depth levels (green-400/500/600)
- Fixed positioning for sticky CTAs at bottom of screen
- Hover states and transitions for interactive feedback

## Testing

- **No Testing Framework**: Currently no automated tests implemented
- **Manual Testing**: Playground files in `/app/api/backend/` for TTS testing
- **Debug Logging**: Extensive console.log statements for development debugging
- **Testing Files**: `ttsTest.ts` and `playground.ts` for manual TTS validation

### Testing Patterns (if implemented)

- Would use Vitest for unit testing (not currently installed)
- Would use Testing Library for component testing
- Test files should follow `*.test.ts` or `*.spec.ts` naming convention

## Architecture

### Frontend Architecture

- **Framework**: Next.js 15 with App Router and React 19
- **State Management**: Centralized state in main page component using React useState
- **Screen Navigation**: State machine pattern with Screen type union
- **Component Library**: shadcn-ui (new-york style) built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with CSS variables and OKLCH color space
- **Icons**: Lucide React icon library
- **Build Tool**: Turbopack for development, Next.js build system for production

### Backend Architecture

- **API Layer**: Next.js API routes with TypeScript
- **AI Services**: OpenAI GPT-4 for content generation, Resemble AI for TTS
- **Response Patterns**: JSON for data, ReadableStream for audio
- **Error Handling**: Try-catch blocks with user-friendly messages
- **Logging**: Comprehensive request/response logging with timing

### Data Flow

1. **User Input** → **Component State** → **Parent Callback** → **API Call** → **State Update** → **Screen Navigation**
2. **Caching**: Lesson content cached in component state (`Record<number, string>`)
3. **Streaming**: Real-time audio generation via ReadableStream responses

## Security

### Current Security Measures

- **Environment Variables**: API keys stored in .env.local (OPENAI_API_KEY, RESEMBLE_AI_*)
- **Input Validation**: Basic request body validation in API routes
- **Error Sanitization**: Generic error messages to prevent information leakage
- **Type Safety**: Strong TypeScript typing throughout application

### Security Limitations

- **No Authentication**: APIs are publicly accessible without authentication
- **No Rate Limiting**: Unprotected against abuse or excessive API usage
- **No Input Sanitization**: Text inputs not sanitized for prompt injection attacks
- **Client-side Secrets**: API calls made directly from client without server proxy

### Security Recommendations

1. Implement authentication system (planned feature)
2. Add rate limiting middleware for API endpoints
3. Sanitize user inputs, especially for AI prompts
4. Move API keys to secure deployment environment variables
5. Add CORS configuration for production deployment
6. Implement request validation middleware

## Git Workflow

- **Current Branch**: main (default branch for hackathon development)
- **No Testing**: No pre-commit hooks or CI/CD (focus on rapid prototyping)
- **Commit Pattern**: Feature-based commits with descriptive messages
- **Dependencies**: Use `npm install` for new packages, update package.json

### Development Guidelines

- Always test API endpoints manually before committing
- Verify TypeScript compilation with `npm run build`
- Check ESLint issues with `npm run lint`
- Test core user flows (topic → depth → plan → content → audio) before major changes

## Configuration

### Environment Variables

Required for full functionality:

```bash
# OpenAI Configuration (required)
OPENAI_API_KEY=your-openai-api-key

# Resemble AI Configuration (required for audio)
RESEMBLE_AI_API_KEY=your-resemble-api-key
RESEMBLE_VOICE_UUID=your-voice-uuid
RESEMBLE_PROJECT_UUID=your-project-uuid
RESEMBLE_STREAM_ENDPOINT=custom-endpoint-url  # optional
```

### Application Constants

Defined in `/lib/constants.ts`:
- `MIN_LESSONS = 3, MAX_LESSONS = 5` - Lesson plan constraints
- `MIN_LESSON_LENGTH = 60, MAX_LESSON_LENGTH = 120` - Duration constraints (seconds)

### shadcn-ui Configuration

Located in `/components.json`:
- **Style**: "new-york" variant
- **Base Color**: neutral
- **CSS Variables**: enabled for theming
- **Icon Library**: lucide-react

## API Reference

### POST /api/generate-plan

Generates AI-powered lesson plans using OpenAI GPT-4.

**Request Body:**
```typescript
{
  topic: string     // What the user wants to learn
  depth: string     // "simple" | "normal" | "advanced"
}
```

**Response:**
```typescript
{
  lessons: LessonPlanData[]
}

interface LessonPlanData {
  id: string
  title: string
  description: string
  duration: number  // seconds (60-120)
}
```

### POST /api/generate-content

Generates detailed lesson scripts for individual lessons.

**Request Body:**
```typescript
{
  topic: string
  depth: string
  lessonTitle: string
  lessonDescription: string
  duration: number
}
```

**Response:**
```typescript
{
  content: string  // Detailed lesson script/content
}
```

### POST /api/generate-lesson-audio

Converts lesson text to audio using Resemble AI TTS.

**Request Body:**
```typescript
{
  text: string
  sampleRate: string        // "8000" | "16000" | "22050" | "32000" | "44100"
  precision?: string        // "MULAW" | "PCM_16" | "PCM_32"
}
```

**Response:**
- Streaming audio response (ReadableStream)
- Content-Type: audio/wav
- Real-time audio generation with time-to-first-sound tracking

## Current Implementation Status

### ✅ Completed Features

- Complete user flow from topic selection to lesson plan generation
- OpenAI GPT-4 integration for intelligent lesson planning
- Mobile-first responsive design with Tailwind CSS v4
- Screen-based navigation with loading states
- Expandable lesson descriptions with smooth animations
- Comprehensive error handling and user feedback
- Real-time audio generation with Resemble AI TTS
- Audio playbook component with HTML5 controls
- Individual lesson content generation
- Content caching to avoid regeneration

### 🚧 Planned Features (Future Development)

- User authentication system
- Local storage persistence for lesson plans
- Advanced audio player controls (speed, rewind/forward)
- Lesson progress tracking
- Personalized learning recommendations
- Offline lesson download capability
- Social sharing features
- Learning analytics and progress reports

## Development Notes

- **Hackathon Focus**: Prioritizes core functionality over production features
- **Rapid Prototyping**: Minimal configuration, maximum feature velocity
- **AI-First**: Designed around AI content generation as core value proposition
- **Mobile Experience**: Optimized for mobile learning on-the-go
- **Debugging**: Extensive logging throughout application for development visibility
- **Performance**: Turbopack for fast development iteration
- **Scalability**: Stateless design ready for horizontal scaling when needed