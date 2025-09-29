# Auto Blog

A Next.js application that integrates with GitHub to automatically generate blog content from repository activity. Built with modern authentication, real-time updates, and a comprehensive GitHub App integration.

## Features

- **Authentication System**: Clerk-based authentication with email/password and OTP verification
- **GitHub Integration**: GitHub App with OAuth and webhook support for installation events
- **Real-time Backend**: Convex for real-time data synchronization and serverless functions
- **Modern UI**: Built with Radix UI components, Tailwind CSS, and Framer Motion animations
- **Type Safety**: Full TypeScript support with Zod schema validation
- **Protected Routes**: Middleware-based authentication protection

## Tech Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **Authentication**: Clerk
- **Backend**: Convex (real-time database + serverless functions)
- **UI Components**: Radix UI, Lucide Icons
- **Styling**: Tailwind CSS 4.x
- **Animations**: Framer Motion
- **State Management**: TanStack React Query
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
│   ├── env.ts                    # Environment variable validation
│   └── middleware.ts             # Route protection middleware
├── convex/                       # Convex backend
│   ├── schema/                   # Database schemas
│   ├── handlers/                 # Webhook handlers
│   ├── action_helpers/           # GitHub action helpers
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
# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Auto Blog
NODE_ENV=development

# GitHub App
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GITHUB_APP_ID=your_app_id
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_PRIVATE_KEY=your_private_key

# Clerk
CLERK_SECRET_KEY=your_clerk_secret
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_url
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

## GitHub Integration

- GitHub App installation webhook triggers Convex actions
- Installation tokens generated using JWT authentication
- Webhook events processed and stored in Convex
- Commit diff analysis for blog content generation

## Development

The application uses:

- **Server Components** for optimal performance
- **Server Actions** for secure mutations
- **React Query** for client-side data fetching
- **Convex** for real-time backend operations
- **Middleware** for authentication protection

## Security

- All secrets stored in environment variables
- `.env*` files ignored by git
- JWT-based GitHub App authentication
- Webhook signature verification
- Protected API routes

## Current Status & TODO

### ✅ Completed

- [x] Project infrastructure setup
- [x] Clerk authentication UI components (sign-in/sign-up with OTP)
- [x] GitHub App integration with JWT authentication
- [x] Convex backend configuration with schemas
- [x] GitHub webhook endpoint receiving events
- [x] Environment variable validation
- [x] Protected routes middleware
- [x] UI component library setup

### 🚧 In Progress / TODO

#### High Priority

- [ ] **Test Clerk Authentication Flow**

  - [ ] Verify email/password sign-up
  - [ ] Test OTP verification
  - [ ] Validate GitHub OAuth integration
  - [ ] Confirm webhook sync to Convex
  - [ ] Test protected routes middleware

- [ ] **Process GitHub Webhook Events**
  - [ ] Handle installation events
  - [ ] Process repository access changes
  - [ ] Store installation data in Convex
  - [ ] Generate and refresh installation tokens
  - [ ] Add webhook event validation and logging

#### Medium Priority

- [ ] Blog content generation from commits
- [ ] Commit analysis and parsing
- [ ] Content template system
- [ ] Automated blog post creation
- [ ] Repository selection UI
- [ ] Dashboard for monitoring GitHub activities

#### Low Priority

- [ ] Add comprehensive error handling
- [ ] Implement rate limiting
- [ ] Add logging and monitoring
- [ ] Write unit and integration tests
- [ ] Add API documentation
- [ ] Optimize performance and caching
- [ ] Add admin panel
