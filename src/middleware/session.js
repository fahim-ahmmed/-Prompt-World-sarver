import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

// Reads the Better Auth session cookie (forwarded through the Next.js proxy) and
// attaches { user, session } to the request. Does NOT reject if there's no session -
// use requireAuth for that. Handy for routes that behave differently when logged in
// but are still publicly reachable (e.g. "featured prompts").
export async function attachSession(req, res, next) {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  req.user = session?.user ?? null;
  req.session = session?.session ?? null;
  next();
}

// Hard-blocks unauthenticated requests.
export async function requireAuth(req, res, next) {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) {
    return res.status(401).json({ message: "You must be logged in to do that." });
  }
  req.user = session.user;
  req.session = session.session;
  next();
}
