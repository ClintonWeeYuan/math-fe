import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bulkImportDiagnosticQuestionsDiagnosticQuestionsBulkImportPost } from '@/client'
import type { BulkImportRequest } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

export default function useBulkImportDiagnosticQuestionsMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (body: BulkImportRequest) =>
            (
                await bulkImportDiagnosticQuestionsDiagnosticQuestionsBulkImportPost({
                    body,
                    headers: getAuthHeaders(),
                })
            ).data,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['diagnostic-questions'] }),
    })
}
