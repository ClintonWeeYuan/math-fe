import { useState } from 'react'
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
                redirectUri: window.location.origin,
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

    async function handleClick() {
        if (isBusy) return
        setIsBusy(true)
        try {
            const msal = await getMsal()
            // A fresh value per attempt, stamped into the token by Microsoft
            // and checked by the backend, so a token captured from one sign-in
            // cannot be posted to start another.
            const nonce = crypto.randomUUID()
            const result = await msal.loginPopup({
                scopes: ['openid', 'profile', 'email'],
                nonce,
                // The account picker every time. Without it a shared or school
                // machine silently signs the previous person back in, which on
                // a page whose whole job is identity is the wrong default.
                prompt: 'select_account',
            })
            if (!result.idToken) {
                setIsBusy(false)
                toast.error(
                    "Microsoft didn't return a sign-in. Please try again."
                )
                return
            }
            signIn({ credential: result.idToken, nonce })
        } catch (error) {
            setIsBusy(false)
            // Closing the popup is a decision, not a failure. Shouting about
            // it would be telling somebody off for changing their mind.
            if (isUserCancellation(error)) return
            toast.error(
                "We couldn't reach Microsoft to sign you in. Please try again."
            )
        }
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

function isUserCancellation(error: unknown): boolean {
    const name = (error as { errorCode?: string } | undefined)?.errorCode
    return name === 'user_cancelled' || name === 'popup_window_error'
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
