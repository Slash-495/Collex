# Collex - Collection Management Platform

A modern, clean collection management platform built with Next.js 14, TypeScript, and Supabase.

## Features

- 🔐 **Authentication**: Secure email-based authentication restricted to @iiitdmj.ac.in domain
- 🎨 **Modern UI**: Clean, Apple-style minimalist design with TailwindCSS and Shadcn UI
- 📱 **Responsive**: Mobile-first responsive design
- ⚡ **Fast**: Built with Next.js 14 App Router and React Query
- 🔒 **Secure**: Supabase backend with proper authentication
- 📊 **Dashboard**: Beautiful statistics and collection overview

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **UI Components**: Shadcn UI
- **Backend**: Supabase
- **State Management**: React Query
- **Styling**: TailwindCSS with custom design system

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd collex
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Add your Supabase credentials to `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Enable Email authentication in Authentication > Providers
3. Copy your project URL and anon key
4. Add them to your `.env.local` file

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main page with auth flow
├── components/            # Reusable components
│   ├── ui/               # Shadcn UI components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   └── navigation/       # Navigation components
└── lib/                  # Utilities and configurations
    ├── supabase.ts       # Supabase client
    ├── auth.tsx          # Authentication context
    └── providers.tsx     # React Query provider
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
