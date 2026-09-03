# AI Prompt Marketplace — Server

Express + MongoDB + Better Auth backend.

## Setup
```bash
cp .env.example .env   # fill in MONGODB_URI, BETTER_AUTH_SECRET, Google OAuth keys
npm install
npm run dev
```

## Why `baseURL: CLIENT_URL` in `src/lib/auth.js`?
The Next.js client proxies every `/api/*` request to this server (see
`client/next.config.mjs`). That means, from the browser's point of view, auth
requests never leave the client's own origin — so Better Auth needs to be
configured as if it *lives* at the client's URL. This is what makes the
session cookie land on the client's domain and what makes the Google OAuth
`redirect_uri` resolve correctly. Don't point it at the port Express actually
listens on.

## Auth endpoints (handled entirely by Better Auth, mounted at `/api/auth/*`)
- `POST /api/auth/sign-up/email`
- `POST /api/auth/sign-in/email`
- `POST /api/auth/sign-in/social` (Google)
- `GET  /api/auth/get-session`
- `POST /api/auth/sign-out`

## App endpoints
- `GET  /api/prompts` — paginated/searchable/filterable list of approved public prompts
- `GET  /api/prompts/featured` — top 6 for the home page
- `GET  /api/prompts/:id` — single prompt (private/premium content redacted server-side)
- `POST /api/prompts` — creator/admin only

## Role-based access
`req.user.role` is one of `user | creator | admin`, added to every session via
`user.additionalFields` in `lib/auth.js`. Protect routes with the two
middlewares in `src/middleware/`:
```js
router.post("/prompts", requireAuth, requireRole("creator", "admin"), createPrompt);
```
