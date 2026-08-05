import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteQuestionQuestionsQuestionIdDelete } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

/**
 * Delete a question outright.
 *
 * Separate from useDeleteQuestionMutation, which invalidates by paper instance
 * — a bulk-imported question has none, so that key would never match and the
 * list would keep showing a question that no longer exists.
 */
export default function useDeleteQuestionByIdMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (questionId: string) => {
            const result = await deleteQuestionQuestionsQuestionIdDelete({
                path: { question_id: questionId },
                headers: getAuthHeaders(),
            })
            if (result.error !== undefined) {
                throw new Error('Could not delete the question.')
            }
            return result.data
        },
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['questions'] }),
    })
}
