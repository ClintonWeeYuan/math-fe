import { useQuery } from '@tanstack/react-query'
import { getAttemptReportDiagnosticAttemptsAttemptIdReportGet } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

type Props = {
    attemptId: string
    enabled?: boolean
}

/**
 * The post-exam report (§6): Skills Radar, flagged-and-never-revisited,
 * per-question timing — for a terminal attempt only. Its own cache entry,
 * separate from the exam screen's attempt-state query, since a report is
 * read long after (and independently of) the live exam.
 *
 * The endpoint 409s while the attempt is still in_progress. We surface
 * that as a typed error (status on it) rather than swallow it, so the page
 * can offer "resume your exam" instead of a generic failure — and we don't
 * retry a 409, since only the student finishing the exam resolves it.
 */
export class AttemptReportError extends Error {
    status?: number
    constructor(status?: number) {
        super(`Failed to load report${status ? ` (${status})` : ''}`)
        this.name = 'AttemptReportError'
        this.status = status
    }
}

export default function useGetAttemptReportQuery({ attemptId, enabled = true }: Props) {
    return useQuery({
        queryKey: ['diagnostic-report', attemptId],
        queryFn: async () => {
            const result = await getAttemptReportDiagnosticAttemptsAttemptIdReportGet({
                path: { attempt_id: attemptId },
                headers: getAuthHeaders(),
            })
            if (result.error !== undefined) {
                throw new AttemptReportError(result.response?.status)
            }
            return result.data
        },
        enabled: enabled && attemptId !== '',
        retry: false,
    })
}
