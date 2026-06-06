# Carefinder

Nigeria's civic hospital directory — search, compare, and share hospital information across all 36 states.

**Live URL:** https://carefinder-qrx4.vercel.app

---

## Overview

Carefinder is a full-stack civic health tool that helps Nigerians find trusted hospitals by location, specialty, and ownership type. Users can search, filter, view on a map, export results, and share hospital lists with others.

---

## Tech Stack

| Layer       | Technology                              |
|-------------|----------------------------------------|
| Frontend    | Next.js 16, TypeScript, Tailwind CSS   |
| Backend     | Supabase (Postgres + PostGIS)          |
| Auth        | Supabase Auth (email/password + RLS)   |
| Map         | Mapbox GL JS                           |
| Email       | Resend API                             |
| CSV Export  | PapaParse                              |
| Testing     | Vitest + React Testing Library + Playwright |
| Deployment  | Vercel                                 |

---

## Features

### Hospital Search & Map
- Search by name, city, or LGA
- Filter by specialty and ownership type (public/private)
- Interactive Mapbox map and list view simultaneously
- PostGIS radius-based search — "hospitals within 10 km"
- Browser Geolocation API for automatic location detection
- Hospital detail page with name, address, phone, email, specialties, visiting hours, Markdown description, and rating

### CSV Export
- Export filtered results to CSV using PapaParse
- Select which columns to include
- Client-side download — no server round-trip
- Filename includes search query and date (e.g. `carefinder-lagos-2025-06-01.csv`)

### Share Hospitals
- Generate shareable URLs with encoded filter parameters
- One-click clipboard copy with feedback toast
- Email hospital lists via Resend API
- Human-readable URLs (e.g. `/search?specialty=maternity`)

### Role-Based Authentication
- Two roles: admin and public user
- Admins authenticate with email/password via Supabase Auth
- RLS policies restrict INSERT, UPDATE, DELETE to admin role
- Public users can read all hospital data without logging in
- Admin dashboard: manage hospitals, moderate reviews
- Admin invite-only via Supabase Edge Function

### Markdown Admin Editor
- React-MD-Editor with live preview
- Hospital descriptions saved as Markdown, rendered as HTML
- Image uploads via Supabase Storage
- Zod form validation (required fields, phone format, coordinate bounds)

### Ratings & Reviews
- Logged-in users can leave 1–5 star ratings and text reviews
- Aggregate rating and review count on cards and detail page
- Reviews require account — reading is public
- Admins can approve/hide reviews from dashboard
- RLS: users can only edit their own reviews

---

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Mapbox account
- Resend account

### Installation

```bash
git clone https://github.com/oladimejipraise/carefinder.git
cd carefinder
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
REVALIDATE_SECRET=your_random_secret
NEXT_PUBLIC_REVALIDATE_SECRET=your_random_secret
```

### Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000`

### Run Tests

```bash
npm run test

# E2E tests (requires dev server running)
npx playwright test
```

---

## Database Setup

Run the SQL scripts in Supabase SQL Editor:

1. Create tables (hospitals, reviews, favourites, hospital_images)
2. Enable PostGIS extension
3. Set up RLS policies
4. Seed 100+ hospitals across all 36 Nigerian states

---

## Deployment

Deployed on Vercel. Every push to `main` triggers an automatic redeployment.

The Supabase Edge Function `invite-admin` is deployed separately:

```bash
supabase functions deploy invite-admin --use-api
```

---

## Admin Access

- Navigate to `/admin/login`
- Log in with admin credentials
- Access dashboard to manage hospitals, moderate reviews, and invite new admins

---

## License

Built for the AltSchool Africa capstone project — 2026.