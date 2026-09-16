import { trackEvent } from '@/lib/analytics.ts'

/**
 * The sign-in wall, measured.
 *
 * Signed-out visitors click "try a diagnostic" far more often than they end up
 * with an account (225 clicks to 67 sign-ups in the four weeks to 16 Sept
 * 2026), and nothing recorded what happened in between. These events fill that
 * gap one step at a time: the prompt pressed, the auth page shown, the method
 * that worked or the reason it didn't.
 *
 * Deliberately no visitor identifier. The steps are read as weekly counts, not
 * joined into a journey, which keeps this free of the storage a consent banner
 * would be needed for. An event sent after sign-in carries the new user's id
 * anyway, through the usual bearer token.
 */

export type AuthPage = 'login' | 'signup'
export type AuthMethod = 'google' | 'microsoft' | 'password' | 'email_code'

export function authPageFromPath(pathname: string): AuthPage {
    return pathname.includes('signup') ? 'signup' : 'login'
}

export function trackAuthPageViewed(page: AuthPage, cameFrom?: string): void {
    trackEvent('auth_page_viewed', {
        metadata: { page, ...(cameFrom ? { from: cameFrom } : {}) },
    })
}

export function trackAuthSucceeded(method: AuthMethod, page: AuthPage): void {
    trackEvent('auth_succeeded', { metadata: { method, page } })
}

/** The reason is the server's own short message, cut to length: enough to
 *  tell "wrong password" from "Google refused the token", never a payload. */
export function trackAuthFailed(method: AuthMethod, page: AuthPage, reason: unknown): void {
    const text = reason instanceof Error ? reason.message : String(reason ?? '')
    trackEvent('auth_failed', {
        metadata: { method, page, reason: text.slice(0, 80) || 'unknown' },
    })
}
