import { useMutation, useQueryClient } from '@tanstack/react-query'
import { submitAttemptDiagnosticAttemptsAttemptIdSubmitPost } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { diagnosticAttemptQueryKey } from '@/lib/diagnosticAttemptQueryKey.ts'

/**
 * Submits (locks) the attempt — the action behind both the auto-submit at
 * timer-zero (this PR) and, later, the manual submit from the review
 * screen (PR 4). No body; answers/flags already landed via the response
 * upsert.
 *
 * Treats 200 (submitted) and 409 (already timed_out) identically: both
 * mean "the exam is over." Rather than branch on the status, it always
 * invalidates the attempt query on settle, so the refetch returns the
 * real terminal status and ExamPage's status switch renders
 * AttemptClosedView — the same mechanism the 409-on-write path already
 * uses. No error toast for the 409: running out of time is an expected
 * outcome, not a failure.
 */
export default function useSubmitAttemptMutation({ attemptId }: { attemptId: string }) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () =>
            (
                await submitAttemptDiagnosticAttemptsAttemptIdSubmitPost({
                    path: { attempt_id: attemptId },
                    headers: getAuthHeaders(),
                })
            ).data,
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: diagnosticAttemptQueryKey(attemptId),
            })
        },
    })
}
