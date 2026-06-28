# LinkBook — Changelog

## 2026-06-24 — Final fix: working AI chatbot with real data

### Problems fixed

1. **Model was too slow** — `mistralai/ministral-14b-instruct-2512` took 30s+ to respond → AI always timed out → fake fallback ran
2. **Fallback generated fake results** — catch block hardcoded "Voici les résultats trouvés :" even when no books matched
3. **`{ role: "system" }" rejected by some models** — caused immediate failure
4. **No frontend action button** — "Je veux vendre" returned intent but nothing was shown

### Solution

| Change | File | Detail |
|--------|------|--------|
| **Fast model** | `.env` → `NVIDIA_MODEL` | `meta/llama-3.2-3b-instruct` (~1s response) |
| **Single user message** | `chatController.js` | System + prompt combined as `{ role: "user" }` (avoids system role issues) |
| **No fake fallback** | `chatController.js` | Catch block just says "AI unavailable" — no fake results |
| **4 intents restored** | `chatController.js` | `search`, `ask_info`, `chat`, `action` with full JSON format |
| **Real DB queries** | `chatController.js` | MongoDB filter with subject/level/location/type/price/condition |
| **Robust JSON parser** | `chatController.js` | Brace-matching extractor handles trailing text |
| **Timeout increased** | `chatController.js` | 60s (model responds in 1-2s, safety margin) |
| **Action button** | `Chatbot.jsx` | "Créer une offre" button when `action: "create-offer"` |

### How it works now

```
User: "je cherche maths 3eme"
  → AI extracts { subject: "maths", level: "3eme" }
  → search intent → MongoDB query → real book results

User: "Je veux vendre un livre"
  → AI detects action intent
  → Returns action: "create-offer" → frontend shows button

User: "Bonjour"
  → chat intent → friendly greeting

User: "je cherche un livre de maths"
  → AI extracts { subject: "maths" }, missing level
  → ask_info intent → "Pour quel niveau ?"
```

All responses come from the NVIDIA API (Qwen/Llama model via NVIDIA's catalog), not hardcoded fallbacks.

## 2026-06-28 — UI overhaul + pricing page + fixes

### Changes

1. **OfferCard** — `aspect-[3/4]` → `aspect-square` for uniform square cards
2. **Grid columns** — `lg:grid-cols-3` → `lg:grid-cols-4` on UserProfile, SearchResults, CommunityFeed, MyOffers
3. **Sidebar** — `w-56` → `w-48` (220px → 192px) on sidebar and navbar spacer
4. **Navbar logo** — `h-14` → `h-16` (56px → 64px) with matching navbar height
5. **Duplicate brand text** — Removed redundant `<span>Linkbook</span>` next to logo in 6 auth pages + homepage footer
6. **Footer links** — Replaced non-functional `<span>` tags with proper `<a href="#terms">` / `<a href="#privacy">` on homepage
7. **Pricing page** — Rewrote `asset-pages/Pricing.jsx` with 3-tier layout (Starter Free / Pro 9DT/mo / Premium 19DT/mo) matching homepage pricing section
8. **Homepage pricing** — Added full pricing section with 3 cards between featured books and footer
9. **Dashboard** — Lowered visual weight of secondary sections (rounded-[40px] → rounded-2xl, lighter borders, muted headings)
10. **Scroll-to-top** — Added `useEffect` in `index.jsx` to scroll to top on every route change (fixes scroll position on JS hash navigation)
11. **JWT error handling** — Server logs clean `Auth error: ${message}` instead of full stack trace; client clears bad token + redirects to login on 401
12. **Duplicate CSS class** — Fixed duplicated `w-full md:w-auto px-8 py-3.5` on homepage search button
