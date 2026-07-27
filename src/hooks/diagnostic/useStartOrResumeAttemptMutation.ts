import { useMutation } from '@tanstack/react-query'
import {
    startOrResumeAttemptDiagnosticAttemptsPost,
    type StartAttemptBody,
} from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { toDiagnosticApiError } from '@/lib/diagnosticApiError.ts'

/**
 * Start-or-resume (§7): the backend endpoint is idempotent per
 * student+set, so this is the single "begin" action — if an in_progress
 * attempt already exists it comes back unchanged, otherwise a new one is
 * created. The caller reads the returned attempt id and navigates to the
 * stable /diagnostic/attempts/{id} URL; a reload there re-fetches via
 * useGetAttemptStateQuery rather than re-POSTing.
 *
 * Throws on error, carrying the status: the generated client resolves
 * { data: undefined, error } instead of rejecting, so returning `.data`
 * blindly made a rejected start a silent no-op — the button did nothing at
 * all. The caller needs the status to tell a 402 (premium set, no Season
 * Pass) apart from a genuine failure.
 */
export default function useStartOrResumeAttemptMutation() {
    return useMutation({
        mutationFn: async (body: StartAttemptBody) => {
            const result = await startOrResumeAttemptDiagnosticAttemptsPost({
                body,
                headers: getAuthHeaders(),
            })
            if (result.error !== undefined) {
                throw toDiagnosticApiError(
                    result,
                    'Could not start the diagnostic.'
                )
            }
            return result.data
        },
    })
}
