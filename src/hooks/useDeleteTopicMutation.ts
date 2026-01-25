import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteTopicTopicsTopicIdDelete } from '@/client'

export default function useDeleteTopicMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (topicId: string) =>
            deleteTopicTopicsTopicIdDelete({ path: { topic_id: topicId } }),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['subject'] }),
    })
}
