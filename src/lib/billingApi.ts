import { client } from '@/client/client.gen'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { toDiagnosticApiError } from '@/lib/diagnosticApiError.ts'

/**
 * The two billing calls, hand-written against the generic client.
 *
 * Not from the generated SDK for the same reason analytics.ts isn't:
 * regenerating rewrites all ~1500 lines of it, which is a change of its own.
 * The endpoints are in the committed openapi.json, so move to the generated
 * methods the next time the client is regenerated.
 */

/** One buyable season, as GET /billing/me describes it. */
export type SeasonOffer = {
    /** "oct-2026" | "jan-2027" — what checkout is called with. */
    key: string
    label: string
    /** ISO date (YYYY-MM-DD) of the last day this pass works. */
    lastDay: string
    /** Minor units, straight from Stripe. Null if it could not be read. */
    priceAmount: number | null
    priceCurrency: string | null
    /** True when something the student already holds runs at least this long,
     *  so buying it would add nothing. */
    alreadyCovered: boolean
}

export type BillingStatus = {
    /** Any live pass, from any season. What the paywall keys off. */
    hasPass: boolean
    /** On sale right now, soonest first. Empty means nothing to sell. */
    seasons: SeasonOffer[]
}

/**
 * Does this student hold a live Season Pass?
 *
 * Answered from our own entitlements table, not from Stripe — a pass can also
 * come from an agent code or a comp. This is also what the post-checkout
 * return page polls: the entitlement is written by Stripe's webhook, not by
 * the redirect, so it lags the payment by a moment.
 */
export async function fetchBillingStatus(
    signedIn: boolean
): Promise<BillingStatus> {
    // Two endpoints, one shape. Signed in, /billing/me answers both questions
    // at once — what is on sale and what this student already holds. Signed
    // out, the price list is still public, because which sittings exist and
    // what they cost are exactly what a paid paper's landing page has to say
    // before anyone makes an account.
    const result = signedIn
        ? await client.get({ url: '/billing/me', headers: getAuthHeaders() })
        : await client.get({ url: '/billing/seasons' })

    if (result.error !== undefined) {
        throw toDiagnosticApiError(result, 'Could not check your Season Pass.')
    }
    return result.data as BillingStatus
}

/**
 * Open a Stripe Checkout Session and return its hosted URL.
 *
 * `season` picks the window ("oct-2026" | "jan-2027"); omitted, the backend
 * assumes the soonest one still on sale.
 *
 * `returnPath` is where Stripe sends a student who backs out. A path, never a
 * URL — the backend refuses anything else, because it is interpolated into a
 * redirect.
 */
export async function createCheckoutSession(
    season?: string,
    returnPath?: string
): Promise<string> {
    const result = await client.post({
        url: '/billing/checkout',
        // The season is a key, not a price — the server looks it up against
        // its own list, so a client cannot name what it pays.
        body: { season: season ?? null, returnPath: returnPath ?? null },
        headers: getAuthHeaders(),
    })
    if (result.error !== undefined) {
        throw toDiagnosticApiError(result, 'Could not start checkout.')
    }
    return (result.data as { checkoutUrl: string }).checkoutUrl
}
