# CampusKit

An equipment checkout tracker for campuses: manage equipment, students, checkouts, and returns.

**Live demo:** https://campuskit-one.vercel.app/

## Features

- Dashboard with active checkouts and anything overdue
- Add and edit equipment, with search and filters
- Student records
- Check equipment out to a student with a due date
- Log returns and the condition the item came back in
- Falls back to demo data if the database is unreachable

## Tech stack

React, TypeScript, Vite, Tailwind CSS, Redux Toolkit, TanStack Query, and Supabase.

## Getting started

```bash
npm install
```

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

The database schema and some seed data are in `supabase/`.

Then start the dev server:

```bash
npm run dev
```

## Scripts

- `npm run dev` starts the dev server
- `npm run build` builds for production
- `npm run preview` previews the production build
- `npm run lint` runs ESLint
- `npm run format` formats `src` with Prettier
