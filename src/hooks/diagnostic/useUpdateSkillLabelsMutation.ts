import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    updateSkillLabelsDiagnosticSkillLabelsPut,
    type SkillLabel,
} from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { toDiagnosticApiError } from '@/lib/diagnosticApiError.ts'

/**
 * Save a subject's whole skill-label set in one call (the Skills screen edits
 * all seven at once). A blank label clears that code server-side, so callers
 * can send every row and let the backend decide upsert-vs-delete.
 *
 * Throws on HTTP error via toDiagnosticApiError — the generated client
 * resolves { data: undefined, error } rather than throwing, so returning
 * `.data` blindly would report a 401/400 as success.
 */
export default function useUpdateSkillLabelsMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            subject,
            labels,
        }: {
            subject: string
            labels: SkillLabel[]
        }) => {
            const result = await updateSkillLabelsDiagnosticSkillLabelsPut({
                body: { subject, labels },
                headers: getAuthHeaders(),
            })
            if (result.error !== undefined) {
                throw toDiagnosticApiError(result, 'Failed to save skill labels')
            }
            return result.data
        },
        onSuccess: (_data, { subject }) =>
            queryClient.invalidateQueries({
                queryKey: ['diagnostic-skill-labels', subject],
            }),
    })
}
