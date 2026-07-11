import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createDiagnosticQuestionDiagnosticQuestionsPost } from '@/client'
import type { CreateDiagnosticQuestionBody } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

export default function useCreateDiagnosticQuestionMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (body: CreateDiagnosticQuestionBody) =>
            (
                await createDiagnosticQuestionDiagnosticQuestionsPost({
                    body,
                    headers: getAuthHeaders(),
                })
            ).data,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['diagnostic-questions'] }),
    })
}
