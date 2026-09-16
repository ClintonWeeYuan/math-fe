import { useMutation } from '@tanstack/react-query'

import {
    type AccountVerificationResponse,
    verifyEmailUsersVerifyPost,
} from '@/client'

type Props = {
    onSuccess: (data: AccountVerificationResponse | undefined) => void
    onError?: (error: Error) => void
}

export function useVerifyAccountMutation({ onSuccess, onError }: Props) {
    return useMutation({
        mutationFn: async (token: string) => {
            const result = await verifyEmailUsersVerifyPost({ query: { token } })
            // The generated client resolves rather than rejects on a 4xx, so
            // an expired or used link has to be turned into an error here or
            // onError never hears about it.
            if (result.error !== undefined) {
                const detail = (result.error as { detail?: unknown }).detail
                throw new Error(typeof detail === 'string' ? detail : 'Verification failed')
            }
            return result.data
        },
        onSuccess,
        onError,
    })
}
