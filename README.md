# NSDR App

A Progressive Web App (PWA) for guided meditation and Non-Sleep Deep Rest (NSDR) sessions, designed to provide comprehensive mental wellness tracking and personalized relaxation experiences.

## Features

- TypeScript + Next.js 13+ frontend
- ASP.NET Core (.NET 7) backend
- PostgreSQL database via Supabase
- Prisma ORM for data management
- Responsive design with TailwindCSS
- User feedback and wellbeing assessment system with post-session analytics

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run the development server: `npm run dev`

## Environment Variables

The following environment variables are required:

- `DATABASE_URL`: PostgreSQL connection string
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase API key
- `SESSION_SECRET`: Secret for session management

## Folder Structure

- `client/`: Frontend React application
- `server/`: Backend Express server
- `shared/`: Shared types and schemas
