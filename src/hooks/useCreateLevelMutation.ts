import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createLevelLevelsPost } from '@/client'

type Props = {
    syllabusId: string
}

export default function useCreateLevelMutation({ syllabusId }: Props) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (name: string) =>
            await createLevelLevelsPost({ body: { name, syllabusId } }),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['syllabus'] }),
    })
}
