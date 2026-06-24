# LinkBook — Changelog

## 2026-06-24 — NVIDIA AI + Chatbot action intent

### AI Provider: Puter.js → NVIDIA

**Problem:** Puter.js AI quota exhausted (`"No usage left for request"`). Every AI call fell back to the regex parser.

**Solution:** Replaced `@heyputer/puter.js` with direct HTTP calls to NVIDIA's API.

| Before | After |
|--------|-------|
| `@heyputer/puter.js` | `axios` (direct HTTP) |
| `puter.ai.chat(model, systemPrompt)` | `POST /v1/chat/completions` |
| Model: `claude-sonnet-4` | Model: `qwen/qwen3.5-122b-a10b` |
| Auth: `PUTER_AUTH_TOKEN` | Auth: `NVIDIA_API_KEY` |

**Model note:** NVIDIA's API for `qwen/qwen3.5-122b-a10b` does **not** accept a `role: "system"` message. The system instruction is prepended to the user message instead.

**Files changed:**
- `server/controllers/chatController.js` — replaced Puter.js init + call with axios POST; removed `@heyputer/puter.js` dependency
- `server/.env` — added `NVIDIA_API_KEY` and `NVIDIA_MODEL`
- `server/package.json` — added `axios`

---

### Chatbot: "Je veux vendre" → action intent

**Problem:** Clicking "🏷️ Je veux vendre un livre" triggered a book search instead of redirecting to the create-offer page. The chatbot had no concept of "action" intents.

**Solution:** Added a new `action` intent to both the AI prompt and the fallback regex parser.

- **AI prompt:** Added `"action"` as a valid intent with `"actionType": "create-offer"`. The model knows to redirect sell/publish/create requests.
- **Fallback parser:** Added `actionWords` array (`vendre`, `créer`, `publier`, etc.) to catch action requests when the AI is unavailable.
- **Frontend (`Chatbot.jsx`):** When the bot response includes `action`, a "Créer une offre" button is rendered.

**Files changed:**
- `server/controllers/chatController.js` — added `action` intent handling + fallback detection
- `frontend/src/components/Chatbot.jsx` — renders action button when `response.action` is set
