# Auto Blog

A Next.js application that integrates with GitHub to automatically generate blog content from repository activity. Built with modern authentication, real-time updates, and a comprehensive GitHub App integration.

## Features

- **Authentication System**: Clerk-based authentication with email/password and OTP verification
- **GitHub Integration**: GitHub App with OAuth and webhook support for installation and commit events
- **AI-Powered Commit Analysis**: Automated commit summarization using OpenRouter LLM integration
- **Real-time Backend**: Convex for real-time data synchronization and serverless functions
- **Modern UI**: Built with Radix UI components, Tailwind CSS, and Framer Motion animations
- **Type Safety**: Full TypeScript support with Zod schema validation
- **Protected Routes**: Middleware-based authentication protection
- **Smart File Filtering**: Excludes irrelevant files (lock files, build artifacts, binaries) from analysis

## Tech Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **Authentication**: Clerk
- **Backend**: Convex (real-time database + serverless functions)
- **AI/LLM**: OpenRouter API with OpenAI SDK (Google Gemini 2.0 Flash)
- **UI Components**: Radix UI, Lucide Icons
- **Styling**: Tailwind CSS 4.x
- **Animations**: Framer Motion
- **Form Handling**: Input OTP, custom auth components
- **GitHub API**: Octokit, JWT-based app authentication

## Project Structure

```
auto-blog/
├── src/
│   ├── app/                      # Next.js app router
│   │   ├── api/                  # API routes
│   │   │   └── webhook/          # Webhook handlers (GitHub, Clerk)
│   │   ├── auth/                 # Auth callback pages
│   │   ├── sign-in/              # Sign-in page
│   │   └── sign-up/              # Sign-up page
│   ├── components/
│   │   ├── authComponents/       # Custom auth UI components
│   │   └── ui/                   # Reusable UI components
│   ├── config/                   # Configuration files
│   ├── github/                   # GitHub API utilities
│   ├── lib/                      # Utility functions
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Utility functions (file filtering, etc.)
│   ├── env.ts                    # Environment variable validation
│   └── middleware.ts             # Route protection middleware
├── convex/                       # Convex backend
│   ├── schema/                   # Database schemas (users, webhooks, commits, repos)
│   ├── handlers/                 # Webhook handlers
│   ├── action_helpers/           # GitHub & OpenRouter action helpers
│   ├── config/                   # GitHub App & OpenRouter config
│   ├── auth.config.ts            # Convex auth configuration
│   └── http.ts                   # HTTP endpoints
└── components.json               # Shadcn UI configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)
- GitHub App credentials
- Clerk account
- Convex account

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Convex
CONVEX_DEPLOYMENT=your_deployment_name
NEXT_PUBLIC_CONVEX_URL=your_convex_url
NEXT_PUBLIC_CONVEX_API_URL=your_convex_api_url

# GitHub App
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GITHUB_APP_ID=your_app_id
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_PRIVATE_KEY=your_private_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Server
NEXT_PUBLIC_API_URL=http://localhost:3000

# OpenRouter (for AI commit summarization)
OPENROUTER_API_KEY=your_openrouter_api_key
```

### Installation

1. Clone the repository:

```bash
git clone https://github.com/KaranMali2001/auto-blog.git
cd auto-blog
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables (see above)

4. Run the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Setting Up GitHub App

1. Create a new GitHub App in your GitHub settings
2. Configure webhook URL: `https://your-domain.com/api/webhook/github`
3. Subscribe to installation events
4. Generate and download private key
5. Add credentials to `.env.local`

### Setting Up Clerk

1. Create a Clerk application
2. Enable email/password and OAuth providers
3. Configure webhook endpoint: `https://your-domain.com/api/webhook/clerk`
4. Add API keys to `.env.local`

### Setting Up Convex

1. Create a Convex project
2. Run `npx convex dev` to set up local development
3. Configure Clerk integration in Convex dashboard
4. Add Convex URL to `.env.local`

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run linter
- `pnpm format` - Format code with Biome

## Authentication Flow

1. User signs up with email/password or GitHub OAuth
2. OTP verification for email sign-ups
3. Clerk webhook syncs user to Convex database
4. Protected routes check authentication via middleware
5. JWT tokens manage GitHub App installation access

## GitHub Integration & AI Analysis Pipeline

1. **Webhook Reception**: GitHub App receives push events with commit data
2. **Event Storage**: Webhook events stored in Convex with status tracking
3. **Commit Processing**: Scheduled action fetches full commit diff using Octokit
4. **Smart Filtering**: Filters out irrelevant files (lock files, binaries, build artifacts, files >500 lines changed)
5. **AI Summarization**: OpenRouter LLM (Google Gemini 2.0 Flash) generates detailed, story-driven commit summaries
6. **Data Persistence**: Commit metadata and AI-generated summaries stored in Convex
7. **Content Aggregation**: Summaries automatically combined into blog posts, LinkedIn updates, or Twitter threads with customizable tone and length
8. **Automated Scheduling**: Cron jobs enable automatic daily/weekly blog generation from recent commits

## Development

The application uses:

- **Server Components** for optimal performance
- **Server Actions** for secure mutations
- **Convex** for real-time backend operations and scheduled actions
- **Middleware** for authentication protection
- **OpenRouter API** for LLM-powered commit analysis

## Security

- All secrets stored in environment variables
- `.env.local` files ignored by git (`.env.example` provided as template)
- JWT-based GitHub App authentication
- Webhook signature verification
- Protected API routes
- Smart file filtering prevents processing sensitive files

## Current Status & TODO

### ✅ Completed

- [x] Project infrastructure setup
- [x] Clerk authentication UI components (sign-in/sign-up with OTP)
- [x] GitHub App integration with JWT authentication
- [x] Convex backend configuration with schemas (users, webhooks, commits, repos)
- [x] GitHub webhook endpoint receiving push events
- [x] Environment variable validation
- [x] Protected routes middleware
- [x] UI component library setup
- [x] OpenRouter LLM integration for commit summarization
- [x] Commit diff fetching and processing pipeline
- [x] Smart file filtering (excludes lock files, binaries, build artifacts)
- [x] Automated commit analysis with AI-generated summaries
- [x] Database schemas for commits and repositories
- [x] Installation token generation and management
- [x] Smooth pagination transitions with scroll-to-top and fade effects
- [x] Improved blog card layout (platform and commit count on single line)
- [x] Blog generation modal with platform selection (Twitter/X, LinkedIn)
- [x] Content customization (tone types: technical, business, hiring manager, custom)
- [x] Length customization (short, medium, long)
- [x] Blog detail page with preview and editing capabilities
- [x] Blog deletion functionality
- [x] Analytics dashboard with stats and breakdowns
- [x] Settings page with profile, GitHub integration, and cron management
- [x] Automated cron job system for scheduled blog generation
- [x] Cron history tracking and management

### 🚧 In Progress / TODO

#### High Priority

- [x] **Test End-to-End Commit Analysis Flow**

  - [x] Verify webhook receives push events
  - [x] Test commit diff extraction
  - [x] Validate file filtering logic
  - [x] Confirm OpenRouter API responses
  - [x] Check commit storage in database
  - [x] Test error handling and retry logic

- [ ] **Content Aggregation System**
  - [x] Design multi-commit aggregation logic
  - [x] Create blog post template engine (LinkedIn & Twitter/X formats)
  - [x] Build LinkedIn update formatter
  - [x] Implement Twitter thread generator
  - [x] Add time-based grouping (automated cron jobs for daily summaries)

#### Medium Priority

- [ ] **Dashboard & UI**

  - [x] Smooth pagination with transitions (blogs and commits pages)
  - [x] Repository selection interface (in cron settings)
  - [x] Commit history viewer with AI summaries (dashboard page)
  - [x] Generated content preview and editing (blog detail page with edit mode)
  - [ ] Publishing workflow (draft → review → publish) - content generation complete, publishing to platforms pending
  - [x] Settings page for customization (profile, GitHub, cron schedules)

- [ ] **Content Publishing**
  - [ ] Blog platform integrations (Dev.to, Medium, Hashnode)
  - [ ] LinkedIn API integration for auto-posting
  - [ ] Twitter API integration for thread publishing
  - [x] Manual export to Markdown (copy functionality in blog detail page)
  - [x] Scheduling system for timed posts (cron job system implemented)
