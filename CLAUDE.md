# Learnify - AI Audio Learning Platform

Learnify is "Spotify for learning" - an endless stream of short, high-quality AI-generated audio tutorials (3-5 minutes each) tailored to user interests and understanding level. The application provides a complete audio learning experience from topic selection to AI-generated lesson playback with professional text-to-speech synthesis.

## Project Structure

```
learnify/
├── app/                                  # Next.js App Router application
│   ├── api/                             # API routes for AI integration
│   │   ├── backend/                     # Backend services
│   │   │   ├── playground.ts           # TTS testing playground
│   │   │   ├── tts.ts                  # Resemble AI TTS integration
│   │   │   └── ttsTest.ts              # TTS utility functions
│   │   ├── generate-content/           # Lesson content generation
│   │   │   └── route.ts               # OpenAI content generation API
│   │   ├── generate-lesson-audio/      # Audio synthesis
│   │   │   └── route.ts               # Resemble AI audio generation
│   │   └── generate-plan/              # Lesson planning
│   │       └── route.ts               # OpenAI lesson plan generation
│   ├── layout.tsx                      # Root layout with Learnify branding
│   ├── page.tsx                        # Main application controller
│   └── globals.css                     # Global styles and Tailwind config
├── components/                          # React components
│   ├── ui/                             # shadcn-ui base components
│   │   ├── button.tsx                 # Button component variants
│   │   ├── card.tsx                   # Card layout components
│   │   ├── input.tsx                  # Form input components
│   │   ├── label.tsx                  # Form label components
│   │   ├── radio-group.tsx            # Radio button groups
│   │   ├── scroll-area.tsx            # Scrollable content areas
│   │   └── textarea.tsx               # Text area inputs
│   ├── AudioPlayer.tsx                 # Audio playback controls and playlist
│   ├── DepthSelection.tsx              # Learning depth selection screen
│   ├── GeneratingContent.tsx           # Content generation loading screen
│   ├── GeneratingPlan.tsx              # Plan generation loading screen
│   ├── LessonContent.tsx               # Audio lesson playback screen
│   ├── LessonPlan.tsx                  # AI-generated lesson plan display
│   └── TopicSelection.tsx              # Topic input screen
├── lib/                                # Utility libraries
│   ├── constants.ts                    # Application constants
│   ├── openai.ts                       # OpenAI GPT-4 integration
│   └── utils.ts                        # Utility functions
├── .env.local                          # Environment variables (API keys)
├── components.json                     # shadcn-ui configuration
├── eslint.config.mjs                   # ESLint configuration
├── middleware.ts                       # HTTP Basic Auth middleware
├── next.config.ts                      # Next.js configuration
├── package.json                        # Dependencies and scripts
├── postcss.config.mjs                  # PostCSS configuration
└── tsconfig.json                       # TypeScript configuration
```

## Build & Commands

- Start development server: `npm run dev --turbopack`
- Build for production: `npm run build`
- Start production server: `npm run start`
- Run linting: `npm run lint`

### Development Environment

- Development server: http://localhost:3000
- Authentication: HTTP Basic Auth (username: `learnify`, password: `agihouse`)
- API routes available at `/api/*`

## Code Style

- TypeScript: Strict mode with comprehensive type checking
- Imports: Path aliases using `@/*` for clean imports
- Tabs for indentation, consistent formatting
- Single quotes, trailing commas
- Use descriptive variable/function names
- Client components marked with "use client" directive
- Comprehensive console logging with emoji indicators throughout
- Component interfaces defined with TypeScript
- Props-based communication between components

## Testing

**Current State**: No testing framework is configured. The codebase lacks:
- Unit tests (no Jest, Vitest, or similar)
- Integration tests  
- E2E tests (no Playwright, Cypress)
- Test files or configurations

This represents a significant gap for production deployment.

## Architecture

- **Frontend**: Next.js 15.3.3 with App Router and React 19
- **Language**: TypeScript v5 with strict configuration
- **Styling**: Tailwind CSS v4 with shadcn-ui components
- **AI Integration**: OpenAI GPT-4 (o3-mini model) for content generation
- **Audio Synthesis**: Resemble AI for text-to-speech conversion
- **State Management**: React local state with prop drilling
- **Authentication**: HTTP Basic Auth via Next.js middleware
- **Build System**: Next.js with Turbopack integration
- **UI Components**: Radix UI primitives with shadcn-ui system

## Security

- HTTP Basic Authentication with hardcoded credentials (development only)
- Environment variables for API keys (OpenAI, Resemble AI)
- No sensitive data logging or exposure
- Middleware-based route protection
- Input validation on API routes

## Git Workflow

- ALWAYS run `npm run lint` before committing
- Run `npm run build` to verify typecheck passes
- NEVER use `git push --force` on the main branch
- Use descriptive commit messages

## Configuration

**Environment Variables Required:**
- `OPENAI_API_KEY`: OpenAI API key for GPT-4 access
- `RESEMBLE_API_KEY`: Resemble AI API key for TTS synthesis

**Key Configuration Files:**
- `.env.local`: Environment variables (not committed)
- `components.json`: shadcn-ui configuration ("new-york" style)
- `tsconfig.json`: TypeScript strict mode with path aliases
- `middleware.ts`: Authentication configuration

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.