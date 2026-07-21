import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bulkImportDiagnosticQuestionsDiagnosticQuestionsBulkImportPost } from '@/client'
import type { BulkImportRequest } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { toDiagnosticApiError } from '@/lib/diagnosticApiError.ts'

/**
 * Bulk-import questions from a JSON file. Throws on error so the dialog's
 * onError toast fires with the backend's message instead of a false success —
 * the generated client resolves { data: undefined, error } on an HTTP error,
 * so returning `.data` blindly reported a rejected import (e.g. a 422 when the
 * JSON doesn't match the schema) as "completed successfully". A pydantic 422's
 * detail is a list, not a string, so it surfaces the fallback; a 400 with a
 * string detail (unknown correctOption, duplicate sourceRef) surfaces verbatim.
 */
export default function useBulkImportDiagnosticQuestionsMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (body: BulkImportRequest) => {
            const result =
                await bulkImportDiagnosticQuestionsDiagnosticQuestionsBulkImportPost(
                    {
                        body,
                        headers: getAuthHeaders(),
                    }
                )
            if (result.error !== undefined) {
                throw toDiagnosticApiError(
                    result,
                    'The file did not match the required schema.'
                )
            }
            return result.data
        },
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['diagnostic-questions'] }),
    })
}
