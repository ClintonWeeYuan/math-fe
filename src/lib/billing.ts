/**
 * Whether the Season Pass can actually be bought. Flip to true when Stripe
 * checkout ships (needs the Stripe account, a Price, and the keys in
 * Railway — see the paywall build plan).
 *
 * While false, paid sets are still locked server-side (starting one 402s),
 * but the UI presents them as "coming soon" rather than dangling an unlock
 * CTA that leads nowhere.
 */
export const BILLING_LIVE = false
