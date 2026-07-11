import { useMutation } from '@tanstack/react-query'
import {
    startOrResumeAttemptDiagnosticAttemptsPost,
    type StartAttemptBody,
} from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

/**
 * Start-or-resume (§7): the backend endpoint is idempotent per
 * student+set, so this is the single "begin" action — if an in_progress
 * attempt already exists it comes back unchanged, otherwise a new one is
 * created. The caller reads the returned attempt id and navigates to the
 * stable /diagnostic/attempts/{id} URL; a reload there re-fetches via
 * useGetAttemptStateQuery rather than re-POSTing.
 */
export default function useStartOrResumeAttemptMutation() {
    return useMutation({
        mutationFn: async (body: StartAttemptBody) =>
            (
                await startOrResumeAttemptDiagnosticAttemptsPost({
                    body,
                    headers: getAuthHeaders(),
                })
            ).data,
    })
}
