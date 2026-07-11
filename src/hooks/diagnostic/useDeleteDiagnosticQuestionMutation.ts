import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteDiagnosticQuestionDiagnosticQuestionsQuestionIdDelete } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

export default function useDeleteDiagnosticQuestionMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (questionId: string) =>
            (
                await deleteDiagnosticQuestionDiagnosticQuestionsQuestionIdDelete({
                    path: { question_id: questionId },
                    headers: getAuthHeaders(),
                })
            ).data,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['diagnostic-questions'] }),
    })
}
