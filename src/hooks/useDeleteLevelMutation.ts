import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteLevelLevelsLevelIdDelete } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

export default function useDeleteLevelMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (levelId: string) =>
            await deleteLevelLevelsLevelIdDelete({
                headers: getAuthHeaders(),
                path: {
                    level_id: levelId,
                },
            }),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['syllabus'] }),
    })
}
