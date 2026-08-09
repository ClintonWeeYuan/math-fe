import { useMutation } from '@tanstack/react-query'

import {
    signInWithGoogleUsersGooglePost,
    type UserLoginResponse,
} from '@/client'

type Props = {
    onSuccess: (_: UserLoginResponse) => void
    onError: (error: Error) => void
}

/** Exchange the ID token Google gave the browser for one of our own. */
export function useGoogleSignInMutation({ onSuccess, onError }: Props) {
    return useMutation({
        mutationFn: async (credential: string) => {
            const { data, error } = await signInWithGoogleUsersGooglePost({
                body: { credential },
            })
            // The generated client resolves rather than throwing on an HTTP
            // error, so a refused sign-in would otherwise look like a success
            // with no user.
            if (error !== undefined || data === undefined) {
                throw new Error(
                    detailOf(error) ?? "We couldn't sign you in with Google."
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
