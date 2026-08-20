import { useMutation } from '@tanstack/react-query'

import { signupAttribution } from '@/lib/signupAttribution.ts'

import type { UserLoginResponse } from '@/client'
import {
    requestEmailLoginCode,
    signInWithEmailCode,
    type EmailCodeRequestResponse,
} from '@/components/auth/emailCodeApi.ts'

/** The generated client resolves rather than throwing on an HTTP error, so a
 * refused call would otherwise look like a success with no data. */
function detailOf(error: unknown): string | undefined {
    const detail = (error as { detail?: unknown } | undefined)?.detail
    if (typeof detail === 'string') return detail
    return undefined
}

type RequestProps = {
    onSuccess: (_: EmailCodeRequestResponse) => void
    onError: (error: Error) => void
}

/** Ask for a sign-in code to be emailed. */
export function useRequestEmailCodeMutation({
    onSuccess,
    onError,
}: RequestProps) {
    return useMutation({
        mutationFn: async (email: string) => {
            const { data, error } = await requestEmailLoginCode({ email })
            if (error !== undefined || data === undefined) {
                throw new Error(
                    detailOf(error) ??
                        "We couldn't send a code just now. Please try again."
                )
            }
            return data
        },
        onSuccess,
        onError,
    })
}

type SignInProps = {
    onSuccess: (_: UserLoginResponse) => void
    onError: (error: Error) => void
}

/** Exchange a code for a session. */
export function useEmailCodeSignInMutation({
    onSuccess,
    onError,
}: SignInProps) {
    return useMutation({
        mutationFn: async (input: { email: string; code: string }) => {
            const { data, error } = await signInWithEmailCode({
                ...input,
                ...signupAttribution(),
            })
            if (error !== undefined || data === undefined) {
                throw new Error(
                    detailOf(error) ?? "That code didn't work. Try again."
                )
            }
            return data
        },
        onSuccess,
        onError,
    })
}
