import { useQuery } from '@tanstack/react-query'
import { listDiagnosticQuestionsDiagnosticQuestionsGet } from '@/client'

type Props = {
    status?: 'draft' | 'published'
    topicCode?: string
}

export default function useListDiagnosticQuestionsQuery({
    status,
    topicCode,
}: Props = {}) {
    return useQuery({
        queryKey: ['diagnostic-questions', status ?? null, topicCode ?? null],
        queryFn: async () =>
            (
                await listDiagnosticQuestionsDiagnosticQuestionsGet({
                    query: {
                        status,
                        topic_code: topicCode,
                    },
                })
            ).data,
    })
}
