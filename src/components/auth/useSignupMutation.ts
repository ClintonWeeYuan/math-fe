import { useMutation } from '@tanstack/react-query'

import { signupAttribution } from '@/lib/signupAttribution.ts'
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
            // The generated client's UserSignup does not carry the
            // attribution fields yet — regenerating it rewrites all ~1500
            // lines — so they are spread in and the body widened here.
            const body = { ...input, ...signupAttribution() }
            return (await signupUsersPost({ body: body as UserSignup })).data
        },
        onSuccess: onSuccess,
        onError,
    })
}
