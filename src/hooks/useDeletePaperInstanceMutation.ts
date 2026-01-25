import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deletePaperPapersInstanceInstanceIdDelete } from '@/client'

type Props = {
    subjectId: string
}
export default function useDeletePaperInstanceMutation({ subjectId }: Props) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (paperInstanceId: string) =>
            await deletePaperPapersInstanceInstanceIdDelete({
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
