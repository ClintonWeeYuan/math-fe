import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuth } from '@/components/auth/AuthContext.tsx'
import { useGoogleSignInMutation } from '@/components/auth/useGoogleSignInMutation.ts'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const GSI_SRC = 'https://accounts.google.com/gsi/client'

/** Whether a Google button will render at all. Anything that refers to the
 *  button — a hint pointing at it, say — has to agree with it, or it points
 *  at nothing. */
export const isGoogleSignInConfigured =
    CLIENT_ID !== undefined && CLIENT_ID !== ''

type GoogleCredentialResponse = { credential?: string }

type GoogleIdentityServices = {
    accounts: {
        id: {
            initialize: (config: {
                client_id: string
                callback: (response: GoogleCredentialResponse) => void
            }) => void
            renderButton: (
                parent: HTMLElement,
                options: Record<string, string | number>
            ) => void
        }
    }
}

declare global {
    interface Window {
        google?: GoogleIdentityServices
    }
}

/** Load Google's script once, however many buttons ask for it. */
let scriptPromise: Promise<void> | undefined

function loadGoogleScript(): Promise<void> {
    if (scriptPromise !== undefined) return scriptPromise

    scriptPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(
            `script[src="${GSI_SRC}"]`
        )
        if (existing !== null) {
            existing.addEventListener('load', () => resolve())
            existing.addEventListener('error', () =>
                reject(new Error('Google sign-in failed to load'))
            )
            return
        }

        const script = document.createElement('script')
        script.src = GSI_SRC
        script.async = true
        script.defer = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Google sign-in failed to load'))
        document.head.appendChild(script)
    })

    return scriptPromise
}

/**
 * Google's own sign-in button.
 *
 * It renders nothing at all when VITE_GOOGLE_CLIENT_ID is unset, or when
 * Google's script can't be reached — a button that cannot work is worse than
 * no button, since the password form beside it still does.
 */
export function GoogleSignInButton() {
    const container = useRef<HTMLDivElement>(null)
    const [isReady, setIsReady] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const from = (location.state as { from?: Location })?.from?.pathname ?? '/'
    const { login: handleLogin } = useAuth()

    const { mutate: signIn } = useGoogleSignInMutation({
        onSuccess: (data) => {
            handleLogin({
                user: data.user,
                token: data.token,
                callback: () => {
                    toast.success('Signed in with Google')
                    navigate(from, { replace: true })
                },
            })
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })

    // signIn is read through a ref so re-rendering never re-initialises
    // Google's widget — it would tear down the button mid-click.
    const signInRef = useRef(signIn)
    signInRef.current = signIn

    useEffect(() => {
        if (CLIENT_ID === undefined || CLIENT_ID === '') return

        let cancelled = false

        loadGoogleScript()
            .then(() => {
                if (cancelled || container.current === null) return
                const google = window.google
                if (google === undefined) return

                google.accounts.id.initialize({
                    client_id: CLIENT_ID,
                    callback: (response) => {
                        if (response.credential === undefined) {
                            toast.error(
                                "Google didn't return a sign-in. Please try again."
                            )
                            return
                        }
                        signInRef.current(response.credential)
                    },
                })
                // Google renders at a fixed pixel width, so it has to be
                // measured — a hard-coded one either falls short of the form
                // on desktop or overflows the card on a phone. The measuring
                // waits a frame because the script can resolve before the
                // card has been laid out, and a width of 0 makes Google fall
                // back to a stub of a button.
                const parent = container.current
                requestAnimationFrame(() => {
                    if (cancelled) return
                    const available = parent.offsetWidth
                    google.accounts.id.renderButton(parent, {
                        theme: 'outline',
                        size: 'large',
                        width: Math.min(400, available > 0 ? available : 320),
                        text: 'continue_with',
                    })
                    setIsReady(true)
                })
            })
            .catch(() => {
                // Leave the password form to it.
            })

        return () => {
            cancelled = true
        }
    }, [])

    if (CLIENT_ID === undefined || CLIENT_ID === '') return null

    return (
        <div className="w-full space-y-4">
            <div ref={container} className="flex justify-center" />
            {isReady && (
                <div className="flex items-center gap-3">
                    <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                    <span className="text-xs uppercase tracking-wide text-slate-400">
                        or
                    </span>
                    <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                </div>
            )}
        </div>
    )
}
