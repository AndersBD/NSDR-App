# NSDR App

A Progressive Web App (PWA) for guided meditation and Non-Sleep Deep Rest (NSDR) sessions, designed to provide comprehensive mental wellness tracking and personalized relaxation experiences.

## Features

- TypeScript + Next.js 13+ frontend
- Supabase Backend as a Service (BaaS) for:
  - Authentication
  - PostgreSQL database
  - File storage for meditation audio
- Responsive design with TailwindCSS
- Anonymous feedback system with post-session analytics
- Enhanced security with Row Level Security (RLS) policies
- Supabase authentication for admin access

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run the development server: `npm run dev`

## Environment Variables

The following environment variables are required:

- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_KEY`: Supabase public API key

## Folder Structure

- `client/`: Frontend React application
  - `src/`: Source code
    - `components/`: React components
    - `hooks/`: Custom React hooks
    - `lib/`: Utility functions and configuration
    - `pages/`: Application pages
    - `types/`: TypeScript type definitions