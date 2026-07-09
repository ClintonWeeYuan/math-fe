import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bulkImportDiagnosticQuestionsDiagnosticQuestionsBulkImportPost } from '@/client'
import type { BulkImportRequest } from '@/client'

export default function useBulkImportDiagnosticQuestionsMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (body: BulkImportRequest) =>
            (
                await bulkImportDiagnosticQuestionsDiagnosticQuestionsBulkImportPost({
                    body,
                })
            ).data,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['diagnostic-questions'] }),
    })
}
