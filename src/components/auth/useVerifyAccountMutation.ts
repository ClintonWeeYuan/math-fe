import { useMutation } from '@tanstack/react-query'

import {
    type AccountVerificationResponse,
    verifyEmailUsersVerifyPost,
} from '@/client'

type Props = {
    onSuccess: (data: AccountVerificationResponse | undefined) => void
}

export function useVerifyAccountMutation({ onSuccess }: Props) {
    return useMutation({
        mutationFn: async (token: string) => {
            return (await verifyEmailUsersVerifyPost({ query: { token } })).data
        },
        onSuccess,
    })
}
