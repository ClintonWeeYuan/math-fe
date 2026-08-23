import type { Configuration } from '@azure/msal-browser'

/**
 * One MSAL configuration, used by both pages that need one.
 *
 * The sign-in button opens the popup; msal-callback.html receives it. MSAL
 * matches the two by their configuration, so a clientId or redirectUri that
 * differed between them would produce a sign-in that starts and never returns
 * — which is a hard thing to see, because each page looks correct alone.
 */

export const MSAL_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID as
    | string
    | undefined

/**
 * Which accounts may sign in. 'common' is both kinds, 'organizations' is work
 * and school only, 'consumers' is personal only. Defaulted so that setting the
 * client id alone is enough — the backend defaults to the same thing.
 */
export const MSAL_TENANT =
    (import.meta.env.VITE_MICROSOFT_TENANT as string | undefined) || 'common'

/**
 * Where Microsoft returns the popup.
 *
 * No `.html`: the static server answers /msal-callback from
 * msal-callback.html directly, but redirects /msal-callback.html to the clean
 * URL. MSAL sends this string to Microsoft twice — once to start the sign-in
 * and once to redeem the code — and both have to be the URL that actually
 * exists, not one that 301s to it.
 *
 * This exact string must also be registered in the app registration.
 */
export function msalRedirectUri(): string {
    return `${window.location.origin}/msal-callback`
}

export function msalConfiguration(): Configuration {
    return {
        auth: {
            clientId: MSAL_CLIENT_ID as string,
            authority: `https://login.microsoftonline.com/${MSAL_TENANT}`,
            redirectUri: msalRedirectUri(),
        },
        cache: {
            // sessionStorage, not localStorage: our own session token is what
            // keeps somebody signed in, and MSAL's cache is only needed for
            // the seconds between opening the popup and posting the token.
            // Leaving Microsoft's account state on the device after that buys
            // nothing and outlives its usefulness.
            cacheLocation: 'sessionStorage',
        },
    }
}
