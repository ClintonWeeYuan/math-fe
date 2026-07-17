import { useQuery } from '@tanstack/react-query'
import { listDiagnosticSetsDiagnosticSetsGet } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

type Props = {
    status?: 'draft' | 'published'
}

/**
 * Every diagnostic set, for the admin sets screen — admin-only (the
 * endpoint is gated by require_admin), and distinct from the student-facing
 * preview query, which only ever serves a single published set.
 */
export default function useListDiagnosticSetsQuery({ status }: Props = {}) {
    return useQuery({
        queryKey: ['diagnostic-sets', status ?? null],
        queryFn: async () =>
            (
                await listDiagnosticSetsDiagnosticSetsGet({
                    query: { status },
                    headers: getAuthHeaders(),
                })
            ).data,
    })
}
