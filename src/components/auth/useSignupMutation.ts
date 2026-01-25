import { useMutation } from '@tanstack/react-query'

import {
    signupUsersPost,
    type UserSignup,
    type UserSignupResponse,
} from '@/client'

type Props = {
    onSuccess: (_: UserSignupResponse | undefined) => void
    onError: (error: Error) => void
}

export function useSignupMutation({ onSuccess, onError }: Props) {
    return useMutation({
        mutationFn: async (input: UserSignup) => {
            return (await signupUsersPost({ body: input })).data
        },
        onSuccess: onSuccess,
        onError,
    })
}
