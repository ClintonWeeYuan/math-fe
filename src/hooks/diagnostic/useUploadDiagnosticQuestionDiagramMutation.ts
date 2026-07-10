import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadDiagnosticQuestionDiagramDiagnosticQuestionsQuestionIdDiagramPost } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

type Variables = {
    questionId: string
    file: File
}

// questionId travels with each mutate() call rather than being bound at hook
// creation time — the create page doesn't know the question's id until the
// create request itself succeeds, so it can't fix a questionId up front the
// way the edit page can.
export default function useUploadDiagnosticQuestionDiagramMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ questionId, file }: Variables) =>
            (
                await uploadDiagnosticQuestionDiagramDiagnosticQuestionsQuestionIdDiagramPost(
                    {
                        path: { question_id: questionId },
                        body: { file },
                        headers: getAuthHeaders(),
                    }
                )
            ).data,
        onSuccess: (_data, { questionId }) => {
            queryClient.invalidateQueries({ queryKey: ['diagnostic-questions'] })
            queryClient.invalidateQueries({
                queryKey: ['diagnostic-question', questionId],
            })
        },
    })
}
