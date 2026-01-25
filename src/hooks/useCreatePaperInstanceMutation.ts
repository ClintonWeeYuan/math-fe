import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPaperInstancePapersInstancePost } from '@/client'

type Props = {
    subjectId: string
}
export default function useCreatePaperInstanceMutation({ subjectId }: Props) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            paperId,
            paperVariantId,
        }: {
            paperId: string
            paperVariantId: string
        }) =>
            await createPaperInstancePapersInstancePost({
                body: {
                    paperId,
                    variantId: paperVariantId,
                },
            }),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: ['paperInstance', subjectId],
            }),
    })
}
