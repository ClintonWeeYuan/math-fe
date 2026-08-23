/**
 * The page Microsoft returns the sign-in popup to.
 *
 * It exists because of how MSAL v5 gets a result out of a popup. Earlier
 * versions had the opener poll the popup's URL, so any page — or a blank one —
 * would do. v5 uses a BroadcastChannel instead: the redirect page has to load
 * MSAL, let it read the response out of its own URL, and post it back to the
 * window that opened it. A page that does not run MSAL never posts anything,
 * and the opener waits until it times out.
 *
 * That is not a hypothetical either. Pointing the redirect at the site root
 * loaded the whole application in the popup, and it still hung — because the
 * homepage never mounts the sign-in button, so MSAL never initialised there.
 * Replacing it with a genuinely blank page hung for exactly the same reason.
 *
 * So this runs MSAL and nothing else. No React, no router, no application: the
 * MSAL chunk is already in the browser's cache from the page that opened this
 * one, so in practice nothing is downloaded at all.
 */

import { PublicClientApplication } from '@azure/msal-browser'
import { msalConfiguration, MSAL_CLIENT_ID } from '@/lib/msalConfig.ts'

async function relayTheSignIn(): Promise<void> {
    if (MSAL_CLIENT_ID === undefined || MSAL_CLIENT_ID === '') return

    const instance = new PublicClientApplication(msalConfiguration())
    await instance.initialize()

    // Reads the code out of this page's own URL and posts it to the opener.
    // Everything after this happens back in the window that started it.
    await instance.handleRedirectPromise()
}

relayTheSignIn().catch((error) => {
    // Nothing useful can be shown here — this window is about to be closed by
    // the one that opened it, and the person is looking at that one. Logged so
    // that a failure has somewhere to be found rather than nowhere.
    console.error('Microsoft sign-in callback failed', error)
})
