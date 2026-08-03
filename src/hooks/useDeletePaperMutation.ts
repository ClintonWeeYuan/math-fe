import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deletePaperPapersPaperIdDelete } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

export default function useDeletePaperMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (paperId: string) =>
            await deletePaperPapersPaperIdDelete({
                headers: getAuthHeaders(),
                path: { paper_id: paperId },
            }),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['subject'] }),
    })
}
