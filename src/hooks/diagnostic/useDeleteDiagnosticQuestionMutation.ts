import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteDiagnosticQuestionDiagnosticQuestionsQuestionIdDelete } from '@/client'

export default function useDeleteDiagnosticQuestionMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (questionId: string) =>
            (
                await deleteDiagnosticQuestionDiagnosticQuestionsQuestionIdDelete({
                    path: { question_id: questionId },
                })
            ).data,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['diagnostic-questions'] }),
    })
}
