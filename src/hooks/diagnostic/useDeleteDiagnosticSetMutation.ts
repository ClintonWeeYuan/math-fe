import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteDiagnosticSetDiagnosticSetsSetIdDelete } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { toDiagnosticApiError } from '@/lib/diagnosticApiError.ts'

/**
 * Delete a diagnostic set. Throws on error so a failure surfaces — in
 * particular the 409 when students have taken the set (the message tells
 * the admin to unpublish it instead), rather than a silent false success.
 */
export default function useDeleteDiagnosticSetMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (setId: string) => {
            const result = await deleteDiagnosticSetDiagnosticSetsSetIdDelete({
                path: { set_id: setId },
                headers: getAuthHeaders(),
            })
            if (result.error !== undefined) {
                throw toDiagnosticApiError(result, 'Failed to delete set')
            }
            return result.data
        },
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['diagnostic-sets'] }),
    })
}
