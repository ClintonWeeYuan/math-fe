import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bulkImportSpmQuestionsQuestionsBulkImportPost } from '@/client'
import type { SpmBulkImportRequest } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { toDiagnosticApiError } from '@/lib/diagnosticApiError.ts'

/**
 * Bulk-import a batch of authored SPM questions.
 *
 * Throws on error rather than returning `.data`: the generated client resolves
 * { data: undefined, error } on an HTTP error, so returning it blindly reports
 * a rejected import as a success. The backend's 400 carries a structured
 * detail — { message, problems[] } — which toDiagnosticApiError surfaces as
 * the message; the dialog renders the problems list from the dry run instead
 * of relying on the error text to explain a whole bad file.
 */
export default function useBulkImportSpmQuestionsMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (body: SpmBulkImportRequest) => {
            const result = await bulkImportSpmQuestionsQuestionsBulkImportPost({
                body,
                headers: getAuthHeaders(),
            })
            if (result.error !== undefined) {
                throw toDiagnosticApiError(
                    result,
                    'The file did not match the required schema.'
                )
            }
            return result.data
        },
        // Both the paper-instance listing and the subject-wide bank can show
        // what was just imported, and which one the admin is looking at depends
        // on whether the batch had a paper instance.
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questions'] })
            queryClient.invalidateQueries({ queryKey: ['paperInstance'] })
        },
    })
}
