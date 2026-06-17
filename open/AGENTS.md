# LinkBook - Tunisian Student Book Exchange Platform

## Overview
LinkBook is a digital platform for Tunisian students to sell, exchange, or donate educational resources (books, manuals, exams). Promotes reuse of educational materials and mutual aid among learners across all 24 Tunisian wilayas.

## Tech Stack
- **Frontend:** React 18 + Vite 5 + Tailwind CSS 3.4 (hash-based router, no React Router)
- **Backend:** Node.js + Express 4.18 (CommonJS)
- **Database:** MongoDB (Atlas cloud) via Mongoose 8.2
- **Auth:** JWT + bcryptjs

## Project Structure
```
LinkBook/
  frontend/
    src/
      index.jsx          # Entry point, hash routing, auth gate
      services/api.js    # Centralized fetch helpers
      layouts/SharedLayout.jsx
      pages/             # HomePage, Login, Register, Dashboard
      asset-pages/       # 15 additional page components
  server/
    index.js             # Express entry (port 5000)
    config/db.js         # Mongoose connection
    models/              # User, Book, Invitation, Transaction, Subscription
    routes/              # auth.js, book.js
    controllers/         # authController.js, bookController.js
    middleware/          # auth.js (JWT), error.js
    utils/generateToken.js
```

## Business Model
- **Annual subscription (10 DT/year):** unlimited access to all features
- **Without subscription:** pay-per-use (2 DT/person for exchange, 1 DT for receiving a donation)
- Free models currently used by the platform for MVP

## Key Features (Phase 1 - MVP)
1. User auth (register/login with email/phone, JWT)
2. Book listings (CRUD with title, subject, level, condition, price, type, photos)
3. Invitation system (buyer invites -> seller accepts one -> phone numbers revealed)
4. Notifications (real-time via Socket.io - planned)
5. Geolocation (Leaflet.js/OpenStreetMap - Phase 2)
6. Subscription/payment system

## Data Models
- **User:** name, email, phone, password, schoolLevel, wilaya, location (lat/lng), isPro, subscriptionActive/expiresAt
- **Book:** title, subject, level, condition, price, type (vente/echange/don), status, images, user ref
- **Invitation:** book ref, buyer ref, seller ref, status (pending/accepted/refused)
- **Transaction:** invitation ref, confirmation date, phone numbers exchanged
- **Subscription:** user ref, startDate, endDate, amount, paymentStatus

## API Endpoints
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)
- `GET /api/books` - List books
- `POST /api/books` - Create book listing (protected)
- `PUT /api/books/:id` - Update book (protected)
- `DELETE /api/books/:id` - Delete book (protected)

## Server Config
- Port: 5000
- MongoDB: Atlas cluster
- JWT: stored in localStorage as `linkbook_token`, sent as Bearer header
- API base: `http://localhost:5000/api`

## Development Phases
1. **MVP** (current) - Auth, Store, Invitations, Notifications, Payment
2. **Map** - Geolocation, interactive map, advanced filters
3. **Social** - Ratings, reviews, enriched profiles
4. **Mobile** - React Native app
5. **Premium** - Seller premium features, analytics

## Session Continuity
This project uses opencode sessions. Always resume the previous session with `opencode -s <session-id>` to maintain context. Changes should build incrementally on prior work.
