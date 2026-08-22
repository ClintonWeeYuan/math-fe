import { useState } from 'react'

import {
    GoogleSignInButton,
    isGoogleSignInConfigured,
} from '@/components/auth/GoogleSignInButton.tsx'
import {
    MicrosoftSignInButton,
    isMicrosoftSignInConfigured,
} from '@/components/auth/MicrosoftSignInButton.tsx'

/** Whether any provider button will render at all. Copy that points at one —
 *  "use Continue with Google above" — has to agree with this, or it points at
 *  nothing. */
export const isProviderSignInConfigured =
    isGoogleSignInConfigured || isMicrosoftSignInConfigured

/**
 * The configured providers, named for prose: "Google", "Microsoft", or
 * "Google or Microsoft".
 *
 * Derived rather than written out because the sentence that uses it tells
 * somebody which button to press, and a hard-coded "Google" would keep saying
 * so on a deployment where only Microsoft is switched on.
 */
export const providerNames = [
    isGoogleSignInConfigured ? 'Google' : undefined,
    isMicrosoftSignInConfigured ? 'Microsoft' : undefined,
]
    .filter((name): name is string => name !== undefined)
    .join(' or ')

/**
 * The sign-in providers, above the divider.
 *
 * A wrapper exists because the divider is the one thing neither button can
 * decide alone. It should appear when there is something above it to divide
 * from and never otherwise: an "or" with nothing over it reads as a page that
 * failed to load. With a single provider that was a question the button could
 * answer itself, which is why Google's used to own it. With two it is not.
 *
 * Google reports when its widget is actually on the page, because its script
 * is remote and may never arrive. Microsoft renders our own markup, so being
 * configured is the same thing as being there.
 */
export function ProviderSignIn() {
    const [isGoogleShowing, setIsGoogleShowing] = useState(false)
    const hasAnyProvider = isGoogleShowing || isMicrosoftSignInConfigured

    return (
        <div className="w-full space-y-3">
            <GoogleSignInButton onReady={() => setIsGoogleShowing(true)} />
            <div className="flex justify-center">
                <MicrosoftSignInButton />
            </div>

            {hasAnyProvider && (
                <div className="flex items-center gap-3 pt-1">
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
