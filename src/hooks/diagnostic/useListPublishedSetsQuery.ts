import { useQuery } from '@tanstack/react-query'
import { listPublishedDiagnosticSetsDiagnosticSetsPublishedGet } from '@/client'

/**
 * The public diagnostics catalogue — every published set, for the student-
 * facing listing page. No auth: the endpoint is public, so this is safe to
 * call for logged-out visitors (starting an attempt still requires login).
 */
export default function useListPublishedSetsQuery() {
    return useQuery({
        queryKey: ['diagnostic-published-sets'],
        queryFn: async () =>
            (await listPublishedDiagnosticSetsDiagnosticSetsPublishedGet()).data,
    })
}
