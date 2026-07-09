import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateDiagnosticQuestionDiagnosticQuestionsQuestionIdPatch } from '@/client'
import type { UpdateDiagnosticQuestionBody } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

type Props = {
    questionId: string
}

export default function useUpdateDiagnosticQuestionMutation({ questionId }: Props) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (body: UpdateDiagnosticQuestionBody) =>
            (
                await updateDiagnosticQuestionDiagnosticQuestionsQuestionIdPatch({
                    path: { question_id: questionId },
                    body,
                    headers: getAuthHeaders(),
                })
            ).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagnostic-questions'] })
            queryClient.invalidateQueries({ queryKey: ['diagnostic-question', questionId] })
        },
    })
}
