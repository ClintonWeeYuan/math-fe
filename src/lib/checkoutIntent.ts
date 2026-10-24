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
const PAPER_KEY = 'jomexam.checkoutPaper'
const RETURN_KEY = 'jomexam.returnTo'
/** Long enough to sign in (or sign up and verify), short enough that an
 *  abandoned intent does not fire on a later, unrelated visit. */
const INTENT_TTL_MS = 30 * 60_000
const RETURN_TTL_MS = 24 * 60 * 60_000
/** Stripe's page plus a slow bank check, with room to spare. */
const PAPER_TTL_MS = 2 * 60 * 60_000

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

/** The start page of one paper: /diagnostic/sets/<id>. */
const PAPER_PATH = /^\/diagnostic\/sets\/([0-9a-f-]{36})$/i

/**
 * The paper a checkout was started from, for the page Stripe returns a buyer
 * to.
 *
 * Stripe's success URL carries only the session id, and the return page used
 * to offer "Browse the papers" — which put the free Mini and Set A back in
 * front of someone who had just paid to open Set D. One October 2026 buyer
 * did exactly that, retook Set A, and never came back. Only a paper's start
 * page is kept: anywhere else (a report, My results) has no single paper to
 * go back to.
 */
export function rememberCheckoutPaper(
    path: string | undefined,
    bought: CheckoutKind = 'pass'
) {
    if (path && PAPER_PATH.test(path)) write(PAPER_KEY, { path, bought })
}

/** What the checkout was for: the Season Pass, or the paper alone. The
 *  return page waits for a different answer in each case — a single paper
 *  never makes `hasPass` true. */
export type CheckoutKind = 'pass' | 'paper'

/** The set id the buyer was trying to open, or null. Not consumed: the
 *  return page may render more than once while it waits for the pass. */
export function peekCheckoutPaper(): string | null {
    const stored = peek<{ path: string }>(PAPER_KEY, PAPER_TTL_MS)
    return stored?.path.match(PAPER_PATH)?.[1] ?? null
}

/** Whether that checkout was for the paper alone. Entries written before
 *  single papers existed carry no kind, and were all for the pass. */
export function peekCheckoutKind(): CheckoutKind {
    const stored = peek<{ bought?: CheckoutKind }>(PAPER_KEY, PAPER_TTL_MS)
    return stored?.bought === 'paper' ? 'paper' : 'pass'
}

export function forgetCheckoutPaper() {
    try {
        localStorage.removeItem(PAPER_KEY)
    } catch {
        // Nothing to forget, or storage blocked: either way, nothing to do.
    }
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
