import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createTopicTopicsPost } from '@/client'

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
