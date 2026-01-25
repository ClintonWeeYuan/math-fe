import { useMutation } from '@tanstack/react-query'

import {
    moreInfoUsersMoreInfoPost,
    type MoreInfoUsersMoreInfoPostResponse,
    type UserMoreInfoForm,
} from '@/client'

type Props = {
    onSuccess: (_: MoreInfoUsersMoreInfoPostResponse | undefined) => void
    onError: (error: Error) => void
}

export function useMoreInformationMutation({ onSuccess, onError }: Props) {
    return useMutation({
        mutationFn: async (input: UserMoreInfoForm) => {
            const token = localStorage.getItem('token')
            if (token === null) {
                throw Error(
                    'User not authorized to provide more information...'
                )
            }

            return (
                await moreInfoUsersMoreInfoPost({
                    body: { ...input },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
            ).data
        },
        onSuccess: onSuccess,
        onError,
    })
}
