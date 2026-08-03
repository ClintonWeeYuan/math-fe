import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteTopicTopicsTopicIdDelete } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

export default function useDeleteTopicMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (topicId: string) =>
            deleteTopicTopicsTopicIdDelete({
                path: { topic_id: topicId },
                headers: getAuthHeaders(),
            }),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['subject'] }),
    })
}
