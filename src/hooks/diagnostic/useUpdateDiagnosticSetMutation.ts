import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateDiagnosticSetDiagnosticSetsSetIdPatch } from '@/client'
import type { UpdateDiagnosticSetBody } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { toDiagnosticApiError } from '@/lib/diagnosticApiError.ts'

type Props = {
    setId: string
}

/**
 * The one write the admin sets screen needs: publish/unpublish, and edit a
 * set's metadata (title, subject, time limit, free-tier). The backend body
 * is exclude_unset, so sending only the field being changed leaves the rest
 * untouched — an explicit null on `subject` is a deliberate "uncategorise",
 * not the same as omitting it.
 */
export default function useUpdateDiagnosticSetMutation({ setId }: Props) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (body: UpdateDiagnosticSetBody) => {
            const result = await updateDiagnosticSetDiagnosticSetsSetIdPatch({
                path: { set_id: setId },
                body,
                headers: getAuthHeaders(),
            })
            // The generated client does NOT throw on an HTTP error — it
            // resolves with { data: undefined, error }. Returning `.data`
            // blindly makes a 401/422 look like a successful mutation:
            // onSuccess fires, a "Set published" toast appears, and nothing
            // has changed. Caught in live testing, where an expired token
            // produced exactly that lie. Throw so onError is what runs.
            if (result.error !== undefined) {
                throw toDiagnosticApiError(result, 'Failed to update set')
            }
            return result.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagnostic-sets'] })
            // The student-facing preview reads the same row (title, time
            // limit, and crucially whether it's published at all), so a
            // publish here must not leave a stale preview cached.
            queryClient.invalidateQueries({ queryKey: ['diagnostic-set-preview', setId] })
        },
    })
}
