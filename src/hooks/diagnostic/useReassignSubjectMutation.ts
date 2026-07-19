import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateDiagnosticSetDiagnosticSetsSetIdPatch } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { toDiagnosticApiError } from '@/lib/diagnosticApiError.ts'

/**
 * Rename or delete a subject across every set that uses it.
 *
 * A subject isn't a stored entity — it's a free-text label on each set — so
 * "rename subject X to Y" (or "delete subject X") is really "set subject = Y
 * (or null) on all the sets currently tagged X". This applies that as one
 * batch over the existing per-set update endpoint (no dedicated subjects
 * table), reporting how many succeeded.
 *
 * subject: null uncategorises the sets — i.e. deletes the subject label.
 */
export default function useReassignSubjectMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            setIds,
            subject,
        }: {
            setIds: string[]
            subject: string | null
        }) => {
            const results = await Promise.allSettled(
                setIds.map(async (setId) => {
                    const result = await updateDiagnosticSetDiagnosticSetsSetIdPatch({
                        path: { set_id: setId },
                        body: { subject },
                        headers: getAuthHeaders(),
                    })
                    if (result.error !== undefined) {
                        throw toDiagnosticApiError(result, 'Failed to update set')
                    }
                    return result.data
                })
            )
            const ok = results.filter((r) => r.status === 'fulfilled').length
            return { ok, failed: results.length - ok }
        },
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['diagnostic-sets'] }),
    })
}
