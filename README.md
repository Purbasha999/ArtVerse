# ArtVerse

A marketplace where local artists list artwork for sale — images, medium, tags, price, and a selling location — and buyers browse, filter, rate, review, and follow the artists they like. Built as a decoupled **Express/MongoDB JSON API** (`backend/`) plus a **React SPA** (`frontend/`), deployable as two independent services.

## Features

**Artwork listings**
- Create/edit/delete artwork listings with up to 8 images (uploaded to Cloudinary), a medium (from a controlled vocabulary), free-text tags, a price, and a selling location.
- The location is geocoded via MapTiler on save, so every artwork gets real map coordinates.

**Browsing & discovery**
- Browse page shows artwork from other users.
- A cluster map (MapTiler) plots every visible artwork by its selling location.
- Sort by recently uploaded (default), highest rated, medium, or location; filter by medium, tag, or a city/state text search — all client-side, instant, no page reloads.

**Ratings & reviews**
- Rating and review text are independent: click a star to rate instantly (no extra "submit" step), and/or leave written feedback — either can exist without the other.
- Average rating + rating count are shown on both the artwork card and detail page; written reviews are displayed on the artwork page.

**User profiles**
- Every user has a profile page (`/users/:id`) displaying their details and a grid of their own listed artwork.
- Follow/unfollow other users from their profile.

**Auth**
- Registration collects name (doubles as username), email, phone, and password; login is username + password.
- Stateless JWT auth: Passport's local strategy (via `passport-local-mongoose`) checks the username/password on login, then the API signs a JWT and sets it as an httpOnly cookie. There's no session store - every later request is authenticated by verifying that cookie and loading the user it identifies.

## Tech stack

| | |
|---|---|
| Backend | Node.js, Express 5, MongoDB + Mongoose, Passport (local strategy) + `jsonwebtoken` for auth, Joi validation, Cloudinary + Multer for image uploads, MapTiler for geocoding |
| Frontend | React 18, Vite, React Router, Axios, Bootstrap 5 + Bootstrap Icons (via CDN), MapTiler SDK for maps |

## Project structure

```
backend/
  app.js                Entry point - middleware, CORS, routes, error handler
  config/                Cloudinary (artwork + avatar storage) and MongoDB connection setup
  models/                Artwork, Review, User (Mongoose schemas)
  controllers/           Route handlers (auth, artworks, reviews, users)
  routes/                 /api/auth, /api/artworks, /api/artworks/:id/reviews, /api/users
  middleware/             Auth guards (attachUser, isLoggedIn, isAuthor, isSelf, isReviewAuthor) + Joi validation
  validators/             Joi schemas (artwork, review)
  utils/                  Shared constants (medium list), JWT sign/verify/cookie helpers, ExpressError
  seeds/                  India-focused demo artwork generator

frontend/
  src/api/                Axios calls per resource (auth, artworks, users)
  src/context/            Auth + alert (flash-message/toast) global state
  src/hooks/              useArtworkFilterSort - shared sort/filter logic for browse + profile grids
  src/components/         Navbar, Footer, artwork cards/grid/filter bar, maps, rating stars, avatar, modal, etc.
  src/pages/               Home, browse, artwork detail, list/edit form, login/register, user profile
  src/styles/              Global CSS + CSS modules for the artwork grid/card/filter bar and the home hero
```

## Prerequisites

- Node.js 18+
- A MongoDB connection string (Atlas or local)
- A Cloudinary account (cloud name, API key, API secret)
- A MapTiler account (API key) - used for geocoding selling locations and rendering maps, centered on India

## Setup

```bash
npm run install:all        # installs backend + frontend dependencies
```

Copy the env templates and fill in your own keys:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Environment variables

**`backend/.env`**

| Variable | Description |
|---|---|
| `DB_URL` | MongoDB connection string |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET` | Cloudinary credentials (used for both artwork images and avatars) |
| `MAPTILER_API_KEY` | Used server-side to geocode artwork locations |
| `JWT_SECRET` | Long random string - signs the login JWT |
| `CLIENT_URL` | Origin of the React frontend (CORS + cookie config); `http://localhost:5173` locally |
| `NODE_ENV` | `development` or `production` - toggles secure/cross-site cookie settings |
| `PORT` | API port (defaults to 3000) |

**`frontend/.env`**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the API, e.g. `http://localhost:3000/api` |
| `VITE_MAPTILER_API_KEY` | Used client-side to render maps in the browser |

## Running locally

```bash
npm run dev                 # runs backend (port 3000) + frontend (port 5173) together
```

or run them separately in two terminals:

```bash
cd backend && npm run dev     # API on :3000 (nodemon)
cd frontend && npm run dev    # SPA on :5173 (Vite)
```

Register at least one account through the app, then optionally seed ~30 demo artworks spread across Indian cities (uses placeholder images until you upload your own):

```bash
npm run seed
```

## API reference

All routes are prefixed with `/api`. Routes marked 🔒 require a valid JWT cookie (i.e. you're logged in).

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create an account (`username`, `email`, `phone`, `password`, `confirmPassword`) |
| POST | `/auth/login` | Log in (`username`, `password`) |
| POST | `/auth/logout` | Log out |
| GET | `/auth/me` | Currently logged-in user (from the JWT cookie), or `null` |
| GET | `/artworks` | List artwork (excludes the logged-in user's own listings) |
| POST 🔒 | `/artworks` | Create an artwork listing (multipart, up to 8 images) |
| GET | `/artworks/:id` | Artwork detail, with populated reviews |
| PUT 🔒 | `/artworks/:id` | Update an artwork (author only) |
| DELETE 🔒 | `/artworks/:id` | Delete an artwork (author only) |
| POST 🔒 | `/artworks/:id/reviews` | Rate and/or review an artwork (upserts your existing entry; blocked on your own artwork) |
| DELETE 🔒 | `/artworks/:id/reviews/:reviewId` | Delete a review (author only) |
| GET | `/users/:id` | Profile: contact info, rating/review counts, follow counts, artwork list |
| PUT 🔒 | `/users/:id` | Update your own profile (name/email/phone/avatar) - self only |
| POST 🔒 | `/users/:id/follow` | Follow a user |
| DELETE 🔒 | `/users/:id/follow` | Unfollow a user |
| GET | `/users/:id/followers` | List of followers (username + avatar) |
| GET | `/users/:id/following` | List of users being followed |
| GET | `/health` | Health check |

## Data models

- **User** — `username` (unique, via passport-local-mongoose), `email`, `phone`, `avatar { url, filename }`, `followers[]`, `following[]`.
- **Artwork** — `title`, `images[]`, `price`, `description`, `medium` (enum, see `backend/utils/constants.js`), `tags[]`, `location`, `geometry` (GeoJSON Point), `artist` (ref User), `reviews[]` (ref Review).
- **Review** — `body` (optional), `rating` 1-5 (optional - either can exist alone), `author` (ref User), `artwork` (ref Artwork). One document per (author, artwork) pair.

## Deployment

The two services are independent and should be deployed separately:
- **Backend**: deploy `backend/` to a Node host (Render, Railway, Fly.io, etc.). Set the backend env vars there, and set `CLIENT_URL` to your deployed frontend's origin (needed for CORS + cookies).
- **Frontend**: `npm run build:frontend` produces a static build in `frontend/dist` - deploy that to any static host (Netlify, Cloudflare Pages, etc.). Set `VITE_API_URL` to your deployed backend's `/api` URL.

Because the frontend and backend live on different origins in production, the JWT cookie is issued with `SameSite=None; Secure` there (see `backend/utils/jwt.js`) - both origins must be served over HTTPS.
