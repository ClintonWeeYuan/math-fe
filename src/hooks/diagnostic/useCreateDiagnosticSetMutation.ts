import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createDiagnosticSetDiagnosticSetsPost } from '@/client'
import type { CreateDiagnosticSetBody } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { toDiagnosticApiError } from '@/lib/diagnosticApiError.ts'

/**
 * Create a diagnostic set by hand (§3) — lands as draft. Throws on error so
 * the caller sees the backend's actual message (e.g. an unknown/duplicate
 * question id → 400) rather than a silent false success.
 */
export default function useCreateDiagnosticSetMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (body: CreateDiagnosticSetBody) => {
            const result = await createDiagnosticSetDiagnosticSetsPost({
                body,
                headers: getAuthHeaders(),
            })
            if (result.error !== undefined) {
                throw toDiagnosticApiError(result, 'Failed to create set')
            }
            return result.data
        },
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['diagnostic-sets'] }),
    })
}
