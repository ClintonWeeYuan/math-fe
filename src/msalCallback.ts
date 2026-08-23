/**
 * The page Microsoft returns the sign-in popup to.
 *
 * MSAL v5 changed how a popup hands its result back, and getting this wrong
 * looks identical to it working: Microsoft signs you in, the popup lands here,
 * and the button waits for a message that never comes.
 *
 * v2 and v3 had the opener poll the popup's URL, so any page — or a blank one
 * — sufficed. v5 does not poll. The opener waits on a BroadcastChannel keyed
 * by the sign-in's state, and the page Microsoft returns to is responsible for
 * reading the response out of its own URL and broadcasting it.
 *
 * Two earlier attempts failed for the same reason without looking like it.
 * Pointing the redirect at the site root loaded the entire application in the
 * popup, and it hung, because the homepage never initialises MSAL. A blank
 * page hung identically, having only removed the 3.8MB. Even constructing a
 * PublicClientApplication here and calling handleRedirectPromise() hung —
 * that processes a response for the window it is in, and nothing in it
 * broadcasts to another window.
 *
 * broadcastResponseToMainFrame is the function that does, and MSAL ships it as
 * its own entry point for exactly this page. It is around 6KB, against 240KB
 * for the library, and needs no configuration: everything it needs is in the
 * URL Microsoft just sent here.
 */

import { broadcastResponseToMainFrame } from '@azure/msal-browser/redirect-bridge'

broadcastResponseToMainFrame().catch((error) => {
    // Nothing useful can be shown here — this window is about to be closed by
    // the one that opened it, and the person is looking at that one. Logged so
    // that a failure has somewhere to be found rather than nowhere.
    console.error('Microsoft sign-in callback failed', error)
})
