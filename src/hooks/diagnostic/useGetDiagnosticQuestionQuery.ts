import { useQuery } from '@tanstack/react-query'
import { getDiagnosticQuestionDiagnosticQuestionsQuestionIdGet } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

type Props = {
    questionId: string
    enabled?: boolean
}

export default function useGetDiagnosticQuestionQuery({
    questionId,
    enabled = true,
}: Props) {
    return useQuery({
        queryKey: ['diagnostic-question', questionId],
        queryFn: async () =>
            (
                await getDiagnosticQuestionDiagnosticQuestionsQuestionIdGet({
                    path: { question_id: questionId },
                    headers: getAuthHeaders(),
                })
            ).data,
        enabled,
    })
}
