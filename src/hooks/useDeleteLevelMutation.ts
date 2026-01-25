import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteLevelLevelsLevelIdDelete } from '@/client'

export default function useDeleteLevelMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (levelId: string) =>
            await deleteLevelLevelsLevelIdDelete({
                path: {
                    level_id: levelId,
                },
            }),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['syllabus'] }),
    })
}
