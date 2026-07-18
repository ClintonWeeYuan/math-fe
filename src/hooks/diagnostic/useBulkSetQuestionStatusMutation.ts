import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bulkSetQuestionStatusDiagnosticQuestionsBulkStatusPost } from '@/client'
import type { BulkQuestionStatusBody } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { toDiagnosticApiError } from '@/lib/diagnosticApiError.ts'

/**
 * Publish/unpublish a batch of questions in one call — the frontend of the
 * bulk-status endpoint. Used to publish all of a set's questions so it can
 * clear its publish gate, without editing them one at a time. Throws on
 * error so a failure surfaces rather than reading as a false success.
 */
export default function useBulkSetQuestionStatusMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (body: BulkQuestionStatusBody) => {
            const result = await bulkSetQuestionStatusDiagnosticQuestionsBulkStatusPost({
                body,
                headers: getAuthHeaders(),
            })
            if (result.error !== undefined) {
                throw toDiagnosticApiError(result, 'Failed to update question statuses')
            }
            return result.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagnostic-questions'] })
            queryClient.invalidateQueries({ queryKey: ['diagnostic-sets'] })
        },
    })
}
