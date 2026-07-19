import { useQuery } from '@tanstack/react-query'
import { getAttemptReportAdminDiagnosticAdminAttemptsAttemptIdReportGet } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { AttemptReportError } from '@/hooks/diagnostic/useGetAttemptReportQuery.ts'

/**
 * The full student report for any attempt — admin-only, not owner-scoped, so a
 * tutor can open a report from the results table. Same shape as the student
 * report; reuses AttemptReportError so a 409 (attempt still in progress) can be
 * handled the same way. Not retried on error (a 409 only clears when the
 * student finishes).
 */
export default function useAdminAttemptReportQuery(attemptId: string) {
    return useQuery({
        queryKey: ['diagnostic-admin-report', attemptId],
        queryFn: async () => {
            const result =
                await getAttemptReportAdminDiagnosticAdminAttemptsAttemptIdReportGet({
                    path: { attempt_id: attemptId },
                    headers: getAuthHeaders(),
                })
            if (result.error !== undefined) {
                throw new AttemptReportError(result.response?.status)
            }
            return result.data
        },
        enabled: attemptId !== '',
        retry: false,
    })
}
