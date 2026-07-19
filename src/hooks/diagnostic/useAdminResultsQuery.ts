import { useQuery } from '@tanstack/react-query'
import { listAttemptResultsDiagnosticAdminResultsGet } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

/**
 * Every diagnostic attempt across all students, newest first — the admin
 * results table. Admin-only (the endpoint is gated by require_admin).
 */
export default function useAdminResultsQuery() {
    return useQuery({
        queryKey: ['diagnostic-admin-results'],
        queryFn: async () =>
            (
                await listAttemptResultsDiagnosticAdminResultsGet({
                    headers: getAuthHeaders(),
                })
            ).data,
    })
}
