import { useMutation } from '@tanstack/react-query'

import { signupAttribution } from '@/lib/signupAttribution.ts'
import { client } from '@/client/client.gen.ts'
import type { UserLoginResponse } from '@/client'

type Props = {
    onSuccess: (_: UserLoginResponse) => void
    onError: (error: Error) => void
}

export type MicrosoftCredential = {
    credential: string
    /** The value the browser asked Microsoft to stamp into the token, so the
     *  backend can check this token was minted for this sign-in. */
    nonce?: string
}

/**
 * Exchange the ID token Microsoft gave the browser for one of our own.
 *
 * Hand-written rather than generated: src/client/ predates POST
 * /users/microsoft, so the generated sdk has no function for it. It still goes
 * through the generated `client`, so the base URL, error shape and
 * resolve-don't-throw behaviour are all the same as every other call.
 * REGEN_TODO.md tracks it for deletion.
 */
export function useMicrosoftSignInMutation({ onSuccess, onError }: Props) {
    return useMutation({
        mutationFn: async ({ credential, nonce }: MicrosoftCredential) => {
            // The generated sdk types a response as a map keyed by status
            // code, and derives `data` from it — matching that shape here is
            // what makes this call behave exactly like a generated one.
            const { data, error } = await client.post<
                { 200: UserLoginResponse },
                { 422: unknown }
            >({
                url: '/users/microsoft',
                headers: { 'Content-Type': 'application/json' },
                // Attribution is only used if this call creates the account;
                // on a sign-in that matches an existing one the server ignores
                // it, since an account has one origin.
                body: { credential, nonce, ...signupAttribution() },
            })
            // The generated client resolves rather than throwing on an HTTP
            // error, so a refused sign-in would otherwise look like a success
            // with no user.
            if (error !== undefined || data === undefined) {
                throw new Error(
                    detailOf(error) ??
                        "We couldn't sign you in with Microsoft."
                )
            }
            return data
        },
        onSuccess,
        onError,
    })
}

function detailOf(error: unknown): string | undefined {
    const detail = (error as { detail?: unknown } | undefined)?.detail
    if (typeof detail === 'string') return detail
    return undefined
}
