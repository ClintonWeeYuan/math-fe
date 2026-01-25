import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTopicTopicsTopicIdPatch } from '@/client'

type Props = {
    topicId: string
}

export default function useUpdateTopicMutation({ topicId }: Props) {
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
            (
                await updateTopicTopicsTopicIdPatch({
                    path: { topic_id: topicId },
                    body: {
                        name,
                        sortOrder,
                        levelId,
                    },
                })
            ).data,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['subject'] }),
    })
}
