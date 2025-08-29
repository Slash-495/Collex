# Collex Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your project URL and anon key from the project settings
3. Add them to your `.env.local` file
4. Enable Email authentication in Authentication > Providers
5. Configure your email templates if needed

## Features

- ✅ Next.js 14 with App Router
- ✅ TypeScript support
- ✅ TailwindCSS for styling
- ✅ Shadcn UI components
- ✅ Supabase client integration
- ✅ React Query for data fetching
- ✅ Authentication with domain restriction (@iiitdmj.ac.in)
- ✅ Clean, Apple-style minimalist UI
- ✅ Responsive design

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── app/           # App router pages
├── components/    # Reusable UI components
│   ├── ui/       # Shadcn UI components
│   └── auth/     # Authentication components
└── lib/          # Utilities and configurations
    ├── supabase.ts
    ├── auth.tsx
    └── providers.tsx
```

