import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createTopicTopicsPost } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

type Props = {
    subjectId: string
}

export default function useCreateTopicMutation({ subjectId }: Props) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            name,
            levelId,
            sortOrder,
        }: {
            name: string
            levelId: string | null
            sortOrder: number
        }) =>
            await createTopicTopicsPost({
                headers: getAuthHeaders(),
                body: {
                    subjectId,
                    name,
                    levelId,
                    sortOrder,
                },
            }),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['subject'] }),
    })
}
