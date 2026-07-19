import { useQuery } from '@tanstack/react-query'
import { getAttemptDetailDiagnosticAdminAttemptsAttemptIdDetailGet } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

/**
 * One attempt's per-question breakdown for the admin drill-in. Disabled until
 * an attempt is selected. Admin-only, and not owner-scoped — an admin can open
 * any student's attempt.
 */
export default function useAdminAttemptDetailQuery(attemptId: string | null) {
    return useQuery({
        queryKey: ['diagnostic-admin-attempt-detail', attemptId],
        enabled: !!attemptId,
        queryFn: async () =>
            (
                await getAttemptDetailDiagnosticAdminAttemptsAttemptIdDetailGet({
                    path: { attempt_id: attemptId as string },
                    headers: getAuthHeaders(),
                })
            ).data,
    })
}
