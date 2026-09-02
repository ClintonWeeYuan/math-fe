/**
 * Whether the Season Pass can actually be bought.
 *
 * Read from the environment rather than hardcoded, so a test-mode build can
 * exercise the whole checkout flow while production stays closed. Set
 * VITE_BILLING_LIVE=true in the frontend's environment once the Stripe
 * account, the Price and the backend keys are all in place — and only then:
 * flipping this on without a configured backend turns the unlock CTA into a
 * 503.
 *
 * While false, paid sets are still locked server-side (starting one 402s),
 * but the UI presents them as "coming soon" rather than dangling an unlock
 * CTA that leads nowhere.
 *
 * Compared against the string 'true' on purpose: every Vite env value is a
 * string, so a bare truthiness check would read "false" as live.
 */
export const BILLING_LIVE = import.meta.env.VITE_BILLING_LIVE === 'true'

/**
 * "16 October 2026" from the ISO date the backend sends.
 *
 * The dates are never hardcoded here. They are season boundaries that can
 * move — the backend owns them and publishes them on GET /billing/me — and a
 * second copy in the frontend would be the one that goes stale and quietly
 * misdescribes what a student is buying.
 */
export function formatSeasonEnd(isoDate: string): string {
    // Parsed as UTC, printed in UTC: a bare YYYY-MM-DD is a calendar date, and
    // letting the local timezone shift it would show "15 October" to anyone
    // west of Greenwich.
    const parsed = new Date(`${isoDate}T00:00:00Z`)
    if (Number.isNaN(parsed.getTime())) return isoDate
    return parsed.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    })
}

/**
 * "£59.00" from Stripe's minor units.
 *
 * The locale stays en-MY while the price is in GBP, which looks wrong and is
 * not. Both locales render GBP identically ("£59.00"), so it makes no
 * difference to what is actually sold — but en-MY renders MYR as "RM 59.00"
 * where en-GB gives "MYR 59.00", so this is the better of the two for a site
 * whose SPM half is Malaysian. Changing it would alter nothing except the
 * currency nobody is charged in.
 *
 * Null when the backend could not read the price from Stripe — the button
 * still works and Stripe's own page shows the real number, so a lookup
 * failure costs a label rather than a sale.
 */
export function formatSeasonPrice(
    amount?: number | null,
    currency?: string | null
): string | null {
    if (amount === null || amount === undefined || !currency) return null
    try {
        return new Intl.NumberFormat('en-MY', {
            style: 'currency',
            currency,
        }).format(amount / 100)
    } catch {
        // An unknown currency code should not blank the whole card.
        return `${currency} ${(amount / 100).toFixed(2)}`
    }
}
