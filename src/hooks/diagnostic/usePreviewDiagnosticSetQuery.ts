import { useQuery } from '@tanstack/react-query'
import { previewDiagnosticSetQuestionsDiagnosticSetsSetIdPreviewGet } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

/**
 * A set's questions exactly as a student meets them, without starting an
 * attempt — so previewing costs no attempt row, no in-progress slot, and no
 * Season Pass.
 */
export default function usePreviewDiagnosticSetQuery({ setId }: { setId: string }) {
    return useQuery({
        queryKey: ['diagnostic-set-preview', setId],
        enabled: setId.length > 0,
        queryFn: async () => {
            const result =
                await previewDiagnosticSetQuestionsDiagnosticSetsSetIdPreviewGet({
                    path: { set_id: setId },
                    headers: getAuthHeaders(),
                })
            // The generated client resolves { data: undefined, error } rather
            // than throwing, so returning `.data` would render an empty exam
            // for a set that failed to load.
            if (result.error !== undefined || result.data === undefined) {
                throw new Error('Could not load this set.')
            }
            return result.data
        },
    })
}
