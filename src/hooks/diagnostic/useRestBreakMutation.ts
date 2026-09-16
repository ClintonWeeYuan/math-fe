import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    endRestBreakDiagnosticAttemptsAttemptIdBreaksDelete,
    startRestBreakDiagnosticAttemptsAttemptIdBreaksPost,
} from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { diagnosticAttemptQueryKey } from '@/lib/diagnosticAttemptQueryKey.ts'

/**
 * Starting and ending a rest break for a student granted one.
 *
 * Both settle by invalidating the attempt query rather than writing the
 * returned state into the cache: ending a break moves the server's deadline,
 * and the exam screen must take that clock from the server, never from
 * arithmetic of its own. A 409 (no allowance left, or the attempt is already
 * over) settles the same way — the refetch then shows why.
 */
export default function useRestBreakMutation({ attemptId }: { attemptId: string }) {
    const queryClient = useQueryClient()
    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: diagnosticAttemptQueryKey(attemptId) })

    const start = useMutation({
        mutationFn: async () =>
            (
                await startRestBreakDiagnosticAttemptsAttemptIdBreaksPost({
                    path: { attempt_id: attemptId },
                    headers: getAuthHeaders(),
                })
            ).data,
        onSettled: invalidate,
    })

    const end = useMutation({
        mutationFn: async () =>
            (
                await endRestBreakDiagnosticAttemptsAttemptIdBreaksDelete({
                    path: { attempt_id: attemptId },
                    headers: getAuthHeaders(),
                })
            ).data,
        onSettled: invalidate,
    })

    return { start, end }
}
