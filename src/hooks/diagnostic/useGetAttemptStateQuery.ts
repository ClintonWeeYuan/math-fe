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
    })
}
