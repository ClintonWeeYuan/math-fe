import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateQuestionQuestionsQuestionIdPatch } from '@/client'
import type { UpdateQuestionBody } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

/**
 * Edit a question's content from the admin.
 *
 * Separate from useUpdateQuestionMutation, which is the paper-instance dialog's
 * narrow version (topics, number, difficulty, marks) and invalidates by paper
 * instance — a bulk-imported question has none, so that key would never match.
 */
export default function useEditQuestionMutation({
    questionId,
}: {
    questionId: string
}) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (body: UpdateQuestionBody) => {
            const result = await updateQuestionQuestionsQuestionIdPatch({
                path: { question_id: questionId },
                body,
                headers: getAuthHeaders(),
            })
            // The generated client resolves { data: undefined, error } instead
            // of throwing, so returning `.data` blindly would close the dialog
            // on an edit the server rejected.
            if (result.error !== undefined) {
                throw new Error('Could not save the question.')
            }
            return result.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questions'] })
            queryClient.invalidateQueries({ queryKey: ['options'] })
        },
    })
}
