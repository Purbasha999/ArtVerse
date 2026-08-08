# ArtVerse

A marketplace where local artists list artwork for sale — images, medium, tags,
price, and a selling location — and buyers browse, rate, and comment. Built as
a decoupled **Express/MongoDB JSON API** (`backend/`) plus a **React SPA**
(`frontend/`), keeping the original YelpCamp MVC architecture but split into
independently deployable services.

## Project structure

```
backend/            Express API (JSON), MVC-style
  config/           Cloudinary + MongoDB setup
  models/           Artwork, Review, User (Mongoose)
  controllers/      Route handlers
  routes/           /api/auth, /api/artworks, /api/artworks/:id/reviews
  middleware/        Auth + validation guards
  validators/        Joi schemas
  seeds/             India-focused demo data generator
  app.js             Entry point

frontend/            React SPA (Vite)
  src/api/            Axios calls per resource
  src/context/        Auth + alert (flash-message) state
  src/components/      Navbar, cards, map widgets, rating stars, etc.
  src/pages/           Home, browse, artwork detail, list/edit form, auth
```

## Prerequisites

- Node.js 18+
- A MongoDB connection string (Atlas or local)
- A Cloudinary account (cloud name, API key, API secret)
- A MapTiler account (API key) - used for geocoding selling locations and
  rendering the map, centered on India

## Setup

```bash
npm run install:all        # installs backend + frontend dependencies
```

Copy the env templates and fill in your own keys:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

`backend/.env` needs `DB_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_KEY`,
`CLOUDINARY_SECRET`, `MAPTILER_API_KEY`, and `SESSION_SECRET`.
`frontend/.env` needs `VITE_API_URL` (defaults to `http://localhost:3000/api`)
and `VITE_MAPTILER_API_KEY`.

## Running locally

```bash
npm run dev                 # runs backend (port 3000) + frontend (port 5173) together
```

Register an account through the app, then optionally seed ~60 demo artworks
spread across Indian cities (uses placeholder images until you upload your
own):

```bash
npm run seed
```

## Deployment

The two services are independent and should be deployed separately:
- **Backend**: deploy `backend/` to a Node host (Render, Railway, Fly.io,
  etc.). Set the backend env vars there, and set `CLIENT_URL` to your
  deployed frontend's origin (needed for CORS + cookies).
- **Frontend**: `npm run build:frontend` produces a static build in
  `frontend/dist` - deploy that to any static host (Netlify, Cloudflare
  Pages, etc.). Set `VITE_API_URL` to your deployed backend's `/api` URL.

Because the frontend and backend live on different origins in production, the
session cookie is issued with `SameSite=None; Secure` there (see
`backend/app.js`) - both origins must be served over HTTPS.
