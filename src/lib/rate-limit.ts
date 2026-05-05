// ============================================================
// FIL: src/lib/rate-limit.ts
//
// Enkel in-memory rate limiter för Next.js API-routes.
// Använder ett Map för att spåra anrop per IP/nyckel.
// OBS: I en serverless-miljö (Vercel) är minnet inte delat
// mellan instanser — vid behov bör detta ersättas med Redis.
// ============================================================

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

function cleanup() {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key)
    }
  }
}

// Kör cleanup var 5:e minut
setInterval(cleanup, 5 * 60 * 1000)

export interface RateLimitOptions {
  intervalMs: number
  maxRequests: number
}

export function rateLimit(key: string, options: RateLimitOptions): { success: boolean; limit: number; remaining: number; resetAt: number } {
  const now = Date.now()
  const existing = store.get(key)

  if (!existing || existing.resetAt < now) {
    const entry: RateLimitEntry = { count: 1, resetAt: now + options.intervalMs }
    store.set(key, entry)
    return { success: true, limit: options.maxRequests, remaining: options.maxRequests - 1, resetAt: entry.resetAt }
  }

  if (existing.count >= options.maxRequests) {
    return { success: false, limit: options.maxRequests, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count += 1
  return { success: true, limit: options.maxRequests, remaining: options.maxRequests - existing.count, resetAt: existing.resetAt }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  return "unknown"
}
