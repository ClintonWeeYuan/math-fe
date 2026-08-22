import { useEffect, useRef } from 'react'
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
 * Call back once with the element's laid-out width.
 *
 * A ResizeObserver rather than a frame or a timeout, because the thing being
 * waited for is a layout, and that is the only API that reports one having
 * happened. It fires immediately when the element already has a width, so the
 * common case costs nothing.
 *
 * Disconnects after the first usable measurement: Google's renderButton draws
 * once and takes a fixed pixel width, so later resizes have nothing to act on
 * and re-rendering would replace a button somebody may be mid-click on.
 */
function onSettledWidth(
    element: HTMLElement,
    render: (width: number) => void
): void {
    const measure = () => Math.floor(element.getBoundingClientRect().width)

    const immediate = measure()
    if (immediate > 0) {
        render(immediate)
        return
    }

    const observer = new ResizeObserver(() => {
        const width = measure()
        if (width <= 0) return
        observer.disconnect()
        render(width)
    })
    observer.observe(element)
}

/**
 * Google's own sign-in button.
 *
 * It renders nothing at all when VITE_GOOGLE_CLIENT_ID is unset, or when
 * Google's script can't be reached — a button that cannot work is worse than
 * no button, since the password form beside it still does.
 *
 * `onReady` fires once the button is actually on the page. ProviderSignIn uses
 * it to decide whether to draw the "or" divider: with more than one provider,
 * whether a divider is warranted stopped being a question this component can
 * answer alone.
 */
export function GoogleSignInButton({ onReady }: { onReady?: () => void } = {}) {
    const container = useRef<HTMLDivElement>(null)
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

    // Read through a ref for the same reason: the effect must not re-run and
    // tear Google's widget down because a parent handed it a new closure.
    const onReadyRef = useRef(onReady)
    onReadyRef.current = onReady

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
                // on desktop or overflows the card on a phone.
                //
                // Measured when the browser reports the container's settled
                // width, not a frame after the script resolves. A single frame
                // is not enough: the script can win the race against layout,
                // and reading the width then returns the document's, not the
                // card's — which is how a 375px phone ended up with a 398px
                // button hanging out of a 343px card.
                onSettledWidth(container.current, (available) => {
                    if (cancelled) return
                    google.accounts.id.renderButton(container.current!, {
                        theme: 'outline',
                        size: 'large',
                        // Google's own bounds are 200 to 400; asking outside
                        // them gets a width of its choosing rather than ours.
                        width: Math.max(200, Math.min(400, available)),
                        text: 'continue_with',
                    })
                    onReadyRef.current?.()
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

    // overflow-hidden is the backstop, not the mechanism: the width above is
    // what makes the button fit. This is what stops a wrong measurement — or a
    // future change to Google's minimum — from pushing the card open.
    return (
        <div
            ref={container}
            className="flex w-full justify-center overflow-hidden"
        />
    )
}
