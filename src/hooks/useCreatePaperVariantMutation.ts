import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createPaperVariantPapersVariantPost } from '@/client'

type Props = {
    syllabusId: string
}

export default function useCreatePaperVariantMutation({ syllabusId }: Props) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ name, year }: { name: string; year: number }) =>
            await createPaperVariantPapersVariantPost({
                body: {
                    syllabusId,
                    name,
                    year,
                },
            }),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['syllabus'] }),
    })
}
