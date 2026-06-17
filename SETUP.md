# LinkBook — Setup & Deployment Guide

## 📋 Overview

LinkBook is a **MERN stack** web application for Tunisian student book exchange.  
**Stack:** MongoDB · Express.js · React (Vite) · Node.js  
**Auth:** JWT + Google OAuth 2.0  
**AI:** Google Gemini · Cloudflare Workers · Mistral (fallback)  
**Payments:** Manual D17/e-Dinar recharge (admin-approved)

---

## 1. Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 18 | Runtime |
| npm | ≥ 9 | Package manager |
| MongoDB | ≥ 6 | Database (local or Atlas) |
| Git | — | Version control |

---

## 2. Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/MohammedSadikZrelli/Link-book.git
cd Link-book

# 2. Install backend dependencies
cd server
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install

# 4. Configure environment
cd ../server
cp .env.example .env
# Edit .env with your secrets (see §3 below)

# 5. Seed the database
node scripts/seedAdmin.js          # Creates admin account
node scripts/seedAssets.js         # Loads 23 frontend images into MongoDB

# 6. Start development servers
# Terminal 1 — Backend (port 5000)
cd server && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 3. Environment Variables (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | `development` or `production` |
| `FRONTEND_URL` | No | Frontend URL for CORS & redirects (default: `http://localhost:5173`) |
| `MONGO_URI` | **Yes** | MongoDB connection string |
| `JWT_SECRET` | **Yes** | Random 64+ char string for JWT signing |
| `GOOGLE_CLIENT_ID` | **Yes\*** | Google OAuth client ID (\*required for Google login) |
| `GOOGLE_CLIENT_SECRET` | **Yes\*** | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | No | Full URL for OAuth callback (default: `http://localhost:5000/api/auth/google/callback`) |
| `EMAIL_USER` | **Yes\*** | Gmail address for sending emails (\*required for OTP/password reset) |
| `EMAIL_APP_PASSWORD` | **Yes\*** | Gmail app password (not your regular password) |
| `GEMINI_API_KEY` | No | Google Gemini AI key (chatbot + book cover analysis) |
| `CLOUDFLARE_ACCOUNT_ID` | No | Cloudflare account ID (vision fallback) |
| `CLOUDFLARE_API_TOKEN` | No | Cloudflare API token |
| `CLOUDFLARE_WORKER_URL` | No | Cloudflare Worker URL for AI cover generation |
| `IMAGE_GENERATION_API_KEY` | No | API key for the cover generation worker |
| `MISTRAL_API_KEY` | No | Mistral AI key (vision fallback) |

### External Service Setup

#### Google OAuth
1. Go to https://console.cloud.google.com/apis/credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
4. Copy `Client ID` → `GOOGLE_CLIENT_ID` and `Client Secret` → `GOOGLE_CLIENT_SECRET`

#### Gmail App Password
1. Enable 2-Factor Authentication on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an app password for "Mail"
4. Copy it to `EMAIL_APP_PASSWORD`

#### Google Gemini AI
1. Go to https://aistudio.google.com/app/apikey
2. Create an API key
3. Copy it to `GEMINI_API_KEY`

---

## 4. Project Structure

```
LinkBook/
├── server/                     # Express.js backend
│   ├── config/                 # DB connection, Passport strategy
│   │   ├── db.js               # Mongoose connection
│   │   └── passport.js         # Google OAuth strategy
│   ├── controllers/            # Business logic (10 files)
│   │   ├── authController.js   # Register, login, OTP, password reset
│   │   ├── bookController.js   # Book CRUD, search, filters
│   │   ├── chatController.js   # Conversations, messages, AI chatbot
│   │   ├── imageController.js  # Image enhancement, AI analysis
│   │   ├── uploadController.js # Multer file uploads
│   │   ├── invitationController.js
│   │   ├── notificationController.js
│   │   ├── paymentController.js
│   │   ├── subscriptionController.js
│   │   └── adminController.js
│   ├── middleware/             # Auth, admin, subscription guards
│   ├── models/                 # Mongoose schemas (7 + Asset)
│   ├── routes/                 # Express routers (12)
│   ├── scripts/                # Database seeders
│   │   ├── seedAdmin.js        # Create admin user
│   │   └── seedAssets.js       # Load images into MongoDB
│   ├── utils/                  # JWT generator, email sender
│   ├── uploads/                # User-uploaded images
│   ├── .env.example            # Template for environment
│   └── index.js                # Server entry point
│
├── frontend/                   # React + Vite SPA
│   ├── public/images/          # 23 static UI images (seeded to DB)
│   ├── src/
│   │   ├── asset-pages/        # Design mockup pages (10)
│   │   ├── pages/              # Active functional pages (22)
│   │   ├── components/         # Chatbot, RestrictedOverlay
│   │   ├── layouts/            # SharedLayout (nav, sidebar)
│   │   ├── services/           # API client, image AI service
│   │   └── assets/svg/         # 1084 SVG illustrations
│   ├── vite.config.js
│   └── package.json
│
├── SETUP.md                    # ← This file
└── .gitignore
```

---

## 5. Database — Models & Collections

| Collection | Model File | Purpose |
|-----------|------------|---------|
| `users` | `User.js` | Students, teachers, admins |
| `books` | `Book.js` | Book listings (sale/exchange/donation) |
| `conversations` | `Conversation.js` | Chat threads |
| `messages` | `Message.js` | Chat messages |
| `invitations` | `Invitation.js` | Book transaction requests |
| `subscriptions` | `Subscription.js` | Pro plan subscriptions |
| `transactions` | `Transaction.js` | Financial records |
| `assets` | `Asset.js` | Frontend images stored in MongoDB |

---

## 6. Available Scripts

### Backend (`server/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server (port 5000) |
| `npm start` | Start server (production) |
| `node scripts/seedAdmin.js` | Create/update admin user |
| `node scripts/seedAssets.js` | Seed frontend images into MongoDB |

### Frontend (`frontend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |

---

## 7. API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/auth/me` | ✅ | Get current user profile |
| POST | `/api/auth/send-verification` | ❌ | Send email OTP |
| POST | `/api/auth/verify-email` | ❌ | Verify email with OTP |
| POST | `/api/auth/forgot` | ❌ | Request password reset |
| POST | `/api/auth/reset/:token` | ❌ | Reset password |
| PUT | `/api/auth/profile` | ✅ | Update profile |
| PUT | `/api/auth/password` | ✅ | Change password |
| GET | `/api/auth/google` | ❌ | Google OAuth login |
| GET | `/api/auth/google/callback` | ❌ | Google OAuth callback |

### Books

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/books` | ❌ | List books (with filters) |
| GET | `/api/books/search` | ❌ | Search books |
| GET | `/api/books/:id` | ✅ | Get single book |
| POST | `/api/books` | ✅ | Create book listing |
| PUT | `/api/books/:id` | ✅ | Update book |
| DELETE | `/api/books/:id` | ✅ | Delete book |

### Other Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/upload` | ✅ | Upload images (max 6, 5MB each) |
| POST | `/api/images/enhance` | ✅ | AI image enhancement |
| POST | `/api/images/analyze` | ✅ | AI book cover analysis |
| POST | `/api/invitations` | ✅ | Send invitation |
| GET | `/api/invitations` | ✅ | List my invitations |
| PUT | `/api/invitations/:id/accept` | ✅ | Accept invitation |
| PUT | `/api/invitations/:id/refuse` | ✅ | Refuse invitation |
| POST | `/api/subscriptions/purchase` | ✅ | Buy Pro subscription |
| POST | `/api/payments/recharge` | ✅ | Request balance recharge |
| POST | `/api/payments/purchase` | ✅ | Purchase a book |
| GET | `/api/payments/history` | ✅ | Transaction history |
| POST | `/api/chat/ask` | ✅ | AI chatbot query |
| GET | `/api/chat/conversations` | ✅ | List conversations |
| POST | `/api/chat/conversations` | ✅ | Start conversation |
| GET | `/api/chat/messages/:id` | ✅ | Get messages |
| POST | `/api/chat/messages` | ✅ | Send message |
| GET | `/api/notifications` | ✅ | Get notifications |
| GET | `/api/assets` | ❌ | List all asset images |
| GET | `/api/assets/:filename` | ❌ | Serve asset image |
| GET | `/api/admin/stats` | ✅ | Dashboard statistics |
| GET | `/api/admin/users` | ✅ | List users (admin) |
| GET | `/api/admin/books` | ✅ | List books (admin) |

---

## 8. Deployment

### Production Build

```bash
# Build frontend
cd frontend && npm run build

# The dist/ output can be served by:
#   Option A: Nginx/Apache as static files
#   Option B: Backend Express (add express.static('frontend/dist'))
```

### Environment Variables for Production

```bash
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
MONGO_URI=mongodb+srv://...   # Atlas URI
JWT_SECRET=<random_64_char_string>
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
CORS_ORIGIN=https://yourdomain.com
```

### Required Infrastructure

| Service | Purpose | Cost |
|---------|---------|------|
| MongoDB Atlas / self-hosted MongoDB | Database | Free tier available |
| Node.js host (VPS, Railway, Render, Fly.io) | Backend API | ~$5–15/mo |
| Static host (Vercel, Netlify, Cloudflare Pages) | Frontend SPA | Free tier available |
| Gmail account | Email sending | Free |
| Google Cloud Console | OAuth + Gemini AI | Free tier available |
| Cloudflare (optional) | AI vision + image generation | Pay-as-you-go |

### Checklist Before Going Live

- [ ] Set `NODE_ENV=production`
- [ ] Set a strong `JWT_SECRET` (64+ random chars)
- [ ] Configure `CORS_ORIGIN` to your frontend domain
- [ ] Set `FRONTEND_URL` to your frontend domain
- [ ] Update `GOOGLE_CALLBACK_URL` to production URL
- [ ] Update Google OAuth console with production callback URL
- [ ] Run `node scripts/seedAssets.js` on the production DB
- [ ] Run `node scripts/seedAdmin.js` on the production DB
- [ ] Remove/disable any debug logging
- [ ] Set up MongoDB backups (Atlas auto-backup or `mongodump` cron)
- [ ] Enable HTTPS (Cloudflare, Let's Encrypt, or platform-provided)

---

## 9. Key Features

- **Free tier:** 1 active sale/exchange listing per user
- **Pro subscription:** 10 DT/year — unlimited listings, full history
- **Donations:** Free for everyone (no subscription needed)
- **Wallet system:** Users recharge via D17/e-Dinar (screenshot proof, admin approves)
- **AI chatbot:** Natural language book search via Google Gemini
- **AI book analysis:** Upload a photo → AI extracts title, author, subject, ISBN, fetches official cover
- **Image optimization:** Automatic sharp-based enhancement on upload
- **Invitation system:** Buyers send requests, sellers accept/refuse
- **Map view:** Books plotted by wilaya (Leaflet.js)
- **Admin dashboard:** User management, book moderation, stats, IP banning

---

## 10. Troubleshooting

| Problem | Solution |
|---------|----------|
| MongoDB connection fails | Check `MONGO_URI` in `.env`. Ensure MongoDB is running or Atlas IP whitelist includes your IP. |
| Google login returns 500 | Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct. Check the callback URL matches the Google Cloud Console exactly. |
| Emails not sending | Use a Gmail app password (not your regular password). Enable "Less secure app access" or use an app-specific password. |
| AI chatbot not responding | Set `GEMINI_API_KEY` in `.env`. Without it, the chatbot returns fallback results. |
| Images not loading | Run `node scripts/seedAssets.js` to load frontend images into MongoDB. |
| CORS errors in browser | Set `FRONTEND_URL` in `server/.env` to match your frontend origin. |
| "JWT_SECERT is not defined" | Add `JWT_SECRET` to your `.env` file (use a random string). |

---

## 11. Security Notes

- **NEVER commit `.env`** — it contains secrets. The `.gitignore` now excludes it.
- The `.env.example` file is safe to commit (placeholder values only).
- JWT tokens expire after **30 days**.
- Password reset tokens expire after **30 minutes** and are stored hashed.
- File uploads are limited to **5 MB per file, max 6 files**.
- Only image extensions (jpg, png, gif, webp) are accepted for upload.
- The `Bearer` token check is case-sensitive and space-sensitive.
- Google OAuth users have no password stored — they cannot use email/password login.

---

## 12. License

Private project — all rights reserved.
