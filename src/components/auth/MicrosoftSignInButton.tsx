import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuth } from '@/components/auth/AuthContext.tsx'
import { useMicrosoftSignInMutation } from '@/components/auth/useMicrosoftSignInMutation.ts'

const CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID as string | undefined

/**
 * Which accounts may sign in. 'common' is both kinds, 'organizations' is work
 * and school only, 'consumers' is personal only. Defaulted so that setting the
 * client id alone is enough — the backend defaults to the same thing.
 */
const TENANT =
    (import.meta.env.VITE_MICROSOFT_TENANT as string | undefined) || 'common'

/** Whether a Microsoft button will render at all. Anything that refers to the
 *  button has to agree with it, or it points at nothing. */
export const isMicrosoftSignInConfigured =
    CLIENT_ID !== undefined && CLIENT_ID !== ''

/**
 * MSAL, loaded only when somebody actually clicks.
 *
 * It is around 200KB, which is a lot to hand every visitor for a button most
 * of them will not press — and this site prerenders 111 pages that are read
 * far more often than they are signed into. A dynamic import keeps it off the
 * initial bundle entirely: the cost falls on the click, where the person is
 * already waiting for a popup.
 *
 * Cached after the first load, so a failed sign-in retried immediately does
 * not fetch it twice.
 */
let msalPromise: Promise<import('@azure/msal-browser').IPublicClientApplication> | undefined

async function getMsal() {
    if (msalPromise !== undefined) return msalPromise

    msalPromise = (async () => {
        const { PublicClientApplication } = await import('@azure/msal-browser')
        const instance = new PublicClientApplication({
            auth: {
                clientId: CLIENT_ID as string,
                authority: `https://login.microsoftonline.com/${TENANT}`,
                // A blank page, not the site root. The popup is returned
                // to this URL, and whatever is there gets loaded in full
                // before MSAL can read the result — so pointing it at the app
                // meant booting a second 3.8MB copy of the whole site inside
                // a 400px window to pass one value to its opener.
                //
                // Must also be registered in the app registration, and lives
                // at the root because serve.json rewrites /auth/** to the app.
                redirectUri: `${window.location.origin}/msal-callback.html`,
            },
            cache: {
                // sessionStorage, not localStorage: our own session token is
                // what keeps somebody signed in, and MSAL's cache is only
                // needed for the seconds between opening the popup and posting
                // the token. Leaving Microsoft's account state on the device
                // after that buys nothing and outlives its usefulness.
                cacheLocation: 'sessionStorage',
            },
        })
        await instance.initialize()

        // Clears any interaction MSAL still believes is running. It records
        // one in sessionStorage before opening the popup and removes it when
        // the popup returns — so a popup that dies without returning, which is
        // exactly what Microsoft's own error page does, leaves the flag set.
        // Every later attempt in that tab then fails with
        // interaction_in_progress, and because sessionStorage survives a
        // reload, refreshing does not help: only closing the tab does.
        //
        // This is the documented remedy and the reason MSAL wants it called on
        // every page load, not just after a redirect.
        await instance.handleRedirectPromise().catch(() => {
            // Nothing to come back from is the normal case.
        })

        return instance
    })()

    // A failed load must not be cached as a permanent failure — the next click
    // should try again rather than find a rejected promise waiting for it.
    msalPromise.catch(() => {
        msalPromise = undefined
    })

    return msalPromise
}

/** Only exported for tests, which have no way to reset a module-level cache. */
export function resetMsalForTests() {
    msalPromise = undefined
}

/**
 * Sign in with a Microsoft account.
 *
 * Rendered as our own button rather than a widget the provider draws, unlike
 * Google's — Microsoft supplies no button of its own, only brand guidance,
 * which is why this one is hand-built and Google's is measured and handed over
 * to a script.
 *
 * Renders nothing when VITE_MICROSOFT_CLIENT_ID is unset: a button that cannot
 * work is worse than no button, since everything beside it still does.
 */
export function MicrosoftSignInButton() {
    const [isBusy, setIsBusy] = useState(false)
    // Held in state, not fetched in the click handler, and that is the whole
    // point — see startSignIn.
    const [msal, setMsal] = useState<
        import('@azure/msal-browser').IPublicClientApplication | null
    >(null)
    const navigate = useNavigate()
    const location = useLocation()
    const from = (location.state as { from?: Location })?.from?.pathname ?? '/'
    const { login: handleLogin } = useAuth()

    const { mutate: signIn } = useMicrosoftSignInMutation({
        onSuccess: (data) => {
            handleLogin({
                user: data.user,
                token: data.token,
                callback: () => {
                    toast.success('Signed in with Microsoft')
                    navigate(from, { replace: true })
                },
            })
        },
        onError: (error) => {
            setIsBusy(false)
            toast.error(error.message)
        },
    })

    // Fetched as soon as the button is on the page rather than on the click.
    // This is not about speed: a browser only allows window.open from inside a
    // user gesture, and an `await` before it ends the gesture. Loading MSAL in
    // the click handler meant loginPopup ran one microtask too late every
    // time, and the popup was blocked before a single request reached
    // Microsoft. The login page is not one of the prerendered marketing pages,
    // so fetching 240KB here after paint costs nobody anything.
    useEffect(() => {
        let cancelled = false
        getMsal()
            .then((instance) => {
                if (!cancelled) setMsal(instance)
            })
            .catch(() => {
                // Leave the button to say so when it is pressed.
            })
        return () => {
            cancelled = true
        }
    }, [])

    /**
     * Open the popup and hand what comes back to the backend.
     *
     * Deliberately not async, and it must stay that way: everything before
     * loginPopup runs in the same tick as the click, which is what keeps the
     * gesture alive.
     */
    function startSignIn(
        instance: import('@azure/msal-browser').IPublicClientApplication
    ) {
        // A fresh value per attempt, stamped into the token by Microsoft and
        // checked by the backend, so a token captured from one sign-in cannot
        // be posted to start another.
        const nonce = crypto.randomUUID()
        instance
            .loginPopup({
                scopes: ['openid', 'profile', 'email'],
                nonce,
                // The account picker every time. Without it a shared or school
                // machine silently signs the previous person back in, which on
                // a page whose whole job is identity is the wrong default.
                prompt: 'select_account',
            })
            .then((result) => {
                if (!result.idToken) {
                    setIsBusy(false)
                    toast.error(
                        "Microsoft didn't return a sign-in. Please try again."
                    )
                    return
                }
                signIn({ credential: result.idToken, nonce })
            })
            .catch((error: unknown) => {
                setIsBusy(false)

                if (isInteractionInProgress(error)) {
                    // Cleared for next time rather than retried now: retrying
                    // needs an await, and an await here would lose the user
                    // gesture and get the popup blocked — trading one failure
                    // for a worse one. Cleaning up in the background makes the
                    // next press work, which is what the message asks for.
                    instance.handleRedirectPromise().catch(() => {})
                    toast.error(
                        "That sign-in didn't finish. Please press the button " +
                            'again.'
                    )
                    return
                }

                reportFailure(error)
            })
    }

    function handleClick() {
        if (isBusy) return
        setIsBusy(true)

        if (msal !== null) {
            startSignIn(msal)
            return
        }

        // Clicked before the preload finished — rare, and the only path where
        // a blocked popup is expected rather than a bug. Awaiting is the only
        // option, and reportFailure says "press it again", which by then works
        // because the instance is cached.
        getMsal().then(
            (instance) => {
                setMsal(instance)
                startSignIn(instance)
            },
            (error: unknown) => {
                setIsBusy(false)
                reportFailure(error)
            }
        )
    }

    if (CLIENT_ID === undefined || CLIENT_ID === '') return null

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isBusy}
            className="flex h-[40px] w-full max-w-[400px] items-center justify-center gap-3 rounded-[4px] border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
            <MicrosoftLogo />
            {isBusy ? 'Signing in…' : 'Continue with Microsoft'}
        </button>
    )
}

function isInteractionInProgress(error: unknown): boolean {
    return (
        (error as { errorCode?: string } | undefined)?.errorCode ===
        'interaction_in_progress'
    )
}

/**
 * Say what actually went wrong.
 *
 * The version this replaces said "we couldn't reach Microsoft" for every
 * failure including the ones where nothing was ever sent to Microsoft, and
 * swallowed the error object entirely. Diagnosing a blocked popup meant
 * reading the deployed bundle and checking the browser had made no network
 * requests, because the app itself had thrown the evidence away.
 */
function reportFailure(error: unknown): void {
    const code = (error as { errorCode?: string } | undefined)?.errorCode

    // Closing the popup is a decision, not a failure. Shouting about it would
    // be telling somebody off for changing their mind.
    if (code === 'user_cancelled') return

    // Kept out of the toast and put where a developer will find it. Nothing
    // here is secret — it is an error from a public client — and without it
    // the next failure is as opaque as this one was.
    console.error('Microsoft sign-in failed', error)

    if (
        code === 'popup_window_error' ||
        code === 'empty_window_error' ||
        code === 'block_nested_popups'
    ) {
        toast.error(
            'Your browser blocked the Microsoft sign-in window. Allow pop-ups ' +
                'for this site, or press the button again.'
        )
        return
    }

    toast.error(
        "We couldn't sign you in with Microsoft. Please try again, or use " +
            'the email code option.'
    )
}

/** Microsoft's four-square mark. Fixed brand colours in both themes, as their
 *  guidance requires — it is their logo, not our palette. */
function MicrosoftLogo() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 21 21"
            aria-hidden="true"
            className="shrink-0"
        >
            <rect x="1" y="1" width="9" height="9" fill="#f25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
            <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
        </svg>
    )
}
