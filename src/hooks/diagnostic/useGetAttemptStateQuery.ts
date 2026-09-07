import { useQuery } from '@tanstack/react-query'
import { getAttemptStateDiagnosticAttemptsAttemptIdGet } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { diagnosticAttemptQueryKey } from '@/lib/diagnosticAttemptQueryKey.ts'

type Props = {
    attemptId: string
    enabled?: boolean
}

/**
 * The exam screen's single source of truth (§7 crash-tolerance: this is
 * also the reconnect/refresh rehydration path — a reload re-fetches the
 * full attempt state and lands the student back where they were). The
 * navigator and question pane both read this one cache entry; the answer/
 * flag mutation patches it optimistically.
 *
 * refetchOnWindowFocus is off deliberately, and this is a correctness fix
 * rather than a tuning knob. main.tsx builds a bare `new QueryClient()`,
 * so the library defaults (staleTime 0, refetch on focus) would otherwise
 * apply here: a student who picks an option and then glances at another
 * window before the PATCH lands comes back to a GET that still reports the
 * pre-write state, and the refetch overwrites the optimistic patch — the
 * answer visibly un-selects itself. They then click again, which is the
 * one behaviour the exam UI must never produce. Nothing on this screen
 * needs focus-driven refresh to stay correct: the countdown is client-side
 * (ExamTimer), a write against an expired attempt 409s and invalidates
 * this query itself, and a genuine reload still refetches via
 * refetchOnMount.
 */
export default function useGetAttemptStateQuery({ attemptId, enabled = true }: Props) {
    return useQuery({
        queryKey: diagnosticAttemptQueryKey(attemptId),
        queryFn: async () =>
            (
                await getAttemptStateDiagnosticAttemptsAttemptIdGet({
                    path: { attempt_id: attemptId },
                    headers: getAuthHeaders(),
                })
            ).data,
        enabled: enabled && attemptId !== '',
        refetchOnWindowFocus: false,
    })
}
