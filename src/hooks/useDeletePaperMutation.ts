import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deletePaperPapersPaperIdDelete } from '@/client'

export default function useDeletePaperMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (paperId: string) =>
            await deletePaperPapersPaperIdDelete({
                path: { paper_id: paperId },
            }),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['subject'] }),
    })
}
