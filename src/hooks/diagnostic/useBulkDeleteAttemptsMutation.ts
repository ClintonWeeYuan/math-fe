import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bulkDeleteAttemptsDiagnosticAdminAttemptsBulkDeletePost } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { toDiagnosticApiError } from '@/lib/diagnosticApiError.ts'

/**
 * Delete the selected attempts (results) — the multi-select delete on the
 * Results table. Admin-only; the backend cascades each attempt's responses and
 * events. Throws on HTTP error via toDiagnosticApiError (the generated client
 * resolves { error } rather than throwing), and refreshes the results list on
 * success.
 */
export default function useBulkDeleteAttemptsMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (attemptIds: string[]) => {
            const result =
                await bulkDeleteAttemptsDiagnosticAdminAttemptsBulkDeletePost({
                    body: { attemptIds },
                    headers: getAuthHeaders(),
                })
            if (result.error !== undefined) {
                throw toDiagnosticApiError(result, 'Failed to delete results')
            }
            return result.data
        },
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['diagnostic-admin-results'] }),
    })
}
