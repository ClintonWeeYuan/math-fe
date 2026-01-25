import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteVariantPapersVariantVariantIdDelete } from '@/client'

export default function useDeletePaperVariantMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (paperVariantId: string) =>
            await deleteVariantPapersVariantVariantIdDelete({
                path: { variant_id: paperVariantId },
            }),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['syllabus'] }),
    })
}
