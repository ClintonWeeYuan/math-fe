import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deletePaperPapersInstanceInstanceIdDelete } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

type Props = {
    subjectId: string
}
export default function useDeletePaperInstanceMutation({ subjectId }: Props) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (paperInstanceId: string) =>
            await deletePaperPapersInstanceInstanceIdDelete({
                headers: getAuthHeaders(),
                path: {
                    instance_id: paperInstanceId,
                },
            }),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: ['paperInstance', subjectId],
            }),
    })
}
