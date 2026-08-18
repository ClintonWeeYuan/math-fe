import { useQuery } from '@tanstack/react-query'
import { listDiagnosticQuestionsDiagnosticQuestionsGet } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

type Props = {
    status?: 'draft' | 'published'
    topicCode?: string
    /**
     * Fetch only these questions.
     *
     * Without it the caller downloads the whole bank and filters in the
     * browser: 1230 questions, 1.89 MB, about four seconds, to display the 27
     * in one set. Pass a set's questionIds and the same screen costs ~43 KB.
     *
     * An empty array means "no questions", not "no filter" — the query is
     * skipped rather than asking the API for everything.
     */
    ids?: string[]
}

export default function useListDiagnosticQuestionsQuery({
    status,
    topicCode,
    ids,
}: Props = {}) {
    return useQuery({
        queryKey: [
            'diagnostic-questions',
            status ?? null,
            topicCode ?? null,
            // Sorted so the same set of ids in a different order is one cache
            // entry, not two.
            ids ? [...ids].sort().join(',') : null,
        ],
        // Nothing to ask for. Left to run, `ids: []` would serialise to no
        // query parameter at all and the API would answer with the whole bank.
        enabled: ids === undefined || ids.length > 0,
        queryFn: async () =>
            (
                await listDiagnosticQuestionsDiagnosticQuestionsGet({
                    query: {
                        status,
                        topic_code: topicCode,
                        // Not in the generated client's types yet; the API
                        // accepts it, and regenerating rewrites all ~1500
                        // lines of the client.
                        ...(ids ? { ids } : {}),
                    } as Record<string, unknown>,
                    headers: getAuthHeaders(),
                })
            ).data,
    })
}
