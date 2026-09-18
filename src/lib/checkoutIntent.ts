import { useEffect } from 'react'
import { toast } from 'sonner'
import { trackEvent } from '@/lib/analytics.ts'

/**
 * Two things a student means to do that sign-in used to forget.
 *
 * Buying: a signed-out student who presses "unlock" on a paid paper has to
 * sign in first, and nothing remembered that they were on their way to pay —
 * they landed back on the paper and had to find the button again. The intent
 * is kept here and taken, once, by the page they come back to.
 *
 * Returning: a password sign-up finishes through an emailed link, which opens
 * a fresh tab with no router state, so the page they started from was lost
 * and they landed on the home page.
 *
 * localStorage rather than sessionStorage because of that emailed link — a
 * new tab has its own session storage. Both entries expire, so a stale
 * intent can never send someone to Stripe days later. Every access is
 * guarded: storage can be blocked, and losing a convenience must not break
 * sign-in.
 */

const INTENT_KEY = 'jomexam.checkoutIntent'
const RETURN_KEY = 'jomexam.returnTo'
/** Long enough to sign in (or sign up and verify), short enough that an
 *  abandoned intent does not fire on a later, unrelated visit. */
const INTENT_TTL_MS = 30 * 60_000
const RETURN_TTL_MS = 24 * 60 * 60_000

type Stored<T> = T & { at: number }

function write(key: string, value: object) {
    try {
        localStorage.setItem(key, JSON.stringify({ ...value, at: Date.now() }))
    } catch {
        // Storage blocked: the student signs in and presses unlock again.
    }
}

function take<T>(key: string, ttl: number): T | null {
    try {
        const raw = localStorage.getItem(key)
        if (!raw) return null
        localStorage.removeItem(key)
        const parsed = JSON.parse(raw) as Stored<T>
        if (typeof parsed.at !== 'number' || Date.now() - parsed.at > ttl) {
            return null
        }
        return parsed
    } catch {
        return null
    }
}

function peek<T>(key: string, ttl: number): T | null {
    try {
        const raw = localStorage.getItem(key)
        if (!raw) return null
        const parsed = JSON.parse(raw) as Stored<T>
        return Date.now() - parsed.at > ttl ? null : parsed
    } catch {
        return null
    }
}

type CheckoutIntent = { season: string; path: string }

export function rememberCheckoutIntent(season: string, path: string) {
    write(INTENT_KEY, { season, path })
    rememberReturnTo(path)
}

/** The season to buy, if the student was on their way to buy it from this
 *  very page. Consumed either way when it matches, so it fires once. */
export function takeCheckoutIntent(path: string): string | null {
    const intent = peek<CheckoutIntent>(INTENT_KEY, INTENT_TTL_MS)
    if (!intent || intent.path !== path) return null
    take<CheckoutIntent>(INTENT_KEY, INTENT_TTL_MS)
    return intent.season
}

/** Only same-site paths, for the same open-redirect reason the backend
 *  checks its own return path. */
function isSafePath(path: unknown): path is string {
    return (
        typeof path === 'string' &&
        path.startsWith('/') &&
        !path.startsWith('//') &&
        !path.includes('\\') &&
        !path.startsWith('/auth')
    )
}

export function rememberReturnTo(path: string) {
    if (isSafePath(path)) write(RETURN_KEY, { path })
}

/** Where a newly signed-up student was heading, or null. Consumed. */
export function takeReturnTo(): string | null {
    const stored = take<{ path: string }>(RETURN_KEY, RETURN_TTL_MS)
    return stored && isSafePath(stored.path) ? stored.path : null
}

/**
 * Stripe sends an abandoning student back with ?checkout=cancelled. Record
 * it, say something kind, and tidy the URL so a refresh does not say it
 * again.
 */
export function useCheckoutCancelledNotice(source: string) {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get('checkout') !== 'cancelled') return
        trackEvent('checkout_cancelled', { metadata: { source } })
        toast("No problem — you haven't been charged. The pass is here whenever you're ready.")
        params.delete('checkout')
        const query = params.toString()
        window.history.replaceState(
            window.history.state,
            '',
            `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
        )
    }, [source])
}
