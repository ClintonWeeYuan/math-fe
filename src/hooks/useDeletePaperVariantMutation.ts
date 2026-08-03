import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteVariantPapersVariantVariantIdDelete } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

export default function useDeletePaperVariantMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (paperVariantId: string) =>
            await deleteVariantPapersVariantVariantIdDelete({
                headers: getAuthHeaders(),
                path: { variant_id: paperVariantId },
            }),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['syllabus'] }),
    })
}
