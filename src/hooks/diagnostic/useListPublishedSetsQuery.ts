import { useQuery } from '@tanstack/react-query'
import { listPublishedDiagnosticSetsDiagnosticSetsPublishedGet } from '@/client'

/** Which admissions test's catalogue to show; omit for the combined one. */
export type DiagnosticTest = 'esat' | 'tmua'

/**
 * The public diagnostics catalogue — published sets for the student-facing
 * listing page. No auth: the endpoint is public, so this is safe to call for
 * logged-out visitors (starting an attempt still requires login). Pass a
 * test to get just that test's sets; the key includes it so ESAT and TMUA
 * cache separately.
 */
export default function useListPublishedSetsQuery(test?: DiagnosticTest) {
    return useQuery({
        queryKey: ['diagnostic-published-sets', test ?? 'all'],
        queryFn: async () =>
            (
                await listPublishedDiagnosticSetsDiagnosticSetsPublishedGet(
                    test ? { query: { test } } : undefined
                )
            ).data,
    })
}
