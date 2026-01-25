import { useMutation } from '@tanstack/react-query'

import { loginUsersLoginPost, type UserLoginResponse } from '@/client'

type MutationInput = {
    email: string
    password: string
}

type Props = {
    onSuccess: (_: UserLoginResponse | undefined) => void
    onError: (error: Error) => void
}

export function useLoginMutation({ onSuccess, onError }: Props) {
    return useMutation({
        mutationFn: async (input: MutationInput) => {
            return (await loginUsersLoginPost({ body: input })).data
        },
        onSuccess,
        onError,
    })
}
