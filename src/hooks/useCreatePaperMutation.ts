import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPaperPapersPost } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

type Props = {
    subjectId: string
}

export default function useCreatePaperMutation({ subjectId }: Props) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ name }: { name: string }) =>
            await createPaperPapersPost({
                headers: getAuthHeaders(),
                body: {
                    name,
                    subjectId,
                },
            }),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['subject'] }),
    })
}
