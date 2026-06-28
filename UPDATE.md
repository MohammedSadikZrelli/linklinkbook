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
