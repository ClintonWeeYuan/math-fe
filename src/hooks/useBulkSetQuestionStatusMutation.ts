import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bulkSetPublishStatusQuestionsBulkStatusPost } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

/**
 * Release a reviewed batch of questions to students, or pull one back.
 *
 * Distinct from useUpdateQuestionStatusMutation, which records a *student's*
 * progress on a question — two different meanings of "status" that both exist
 * in this codebase.
 */
export default function useBulkSetQuestionStatusMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            questionIds,
            status,
        }: {
            questionIds: string[]
            status: 'draft' | 'published'
        }) => {
            const result = await bulkSetPublishStatusQuestionsBulkStatusPost({
                body: { questionIds, status },
                headers: getAuthHeaders(),
            })
            // The generated client resolves { data: undefined, error } rather
            // than throwing, so returning `.data` blindly would report a batch
            // as released when nothing changed.
            if (result.error !== undefined || result.data === undefined) {
                throw new Error('Could not update the questions.')
            }
            return result.data
        },
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['questions'] }),
    })
}
