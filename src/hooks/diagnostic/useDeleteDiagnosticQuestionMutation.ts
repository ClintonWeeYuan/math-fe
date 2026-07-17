import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteDiagnosticQuestionDiagnosticQuestionsQuestionIdDelete } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { toDiagnosticApiError } from '@/lib/diagnosticApiError.ts'

export default function useDeleteDiagnosticQuestionMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (questionId: string) => {
            const result = await deleteDiagnosticQuestionDiagnosticQuestionsQuestionIdDelete({
                path: { question_id: questionId },
                headers: getAuthHeaders(),
            })
            // Surface the failure (esp. PR C's 409 when a set still holds this
            // question, whose detail names the sets) instead of the generic
            // client returning undefined and this reading as a success.
            if (result.error !== undefined) {
                throw toDiagnosticApiError(result, 'Failed to delete question')
            }
            return result.data
        },
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['diagnostic-questions'] }),
    })
}
