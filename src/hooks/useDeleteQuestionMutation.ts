import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteQuestionQuestionsQuestionIdDelete } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

type Props = { paperInstanceId: string }

export default function useDeleteQuestionMutation({ paperInstanceId }: Props) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (questionId: string) =>
            await deleteQuestionQuestionsQuestionIdDelete({
                headers: getAuthHeaders(),
                path: {
                    question_id: questionId,
                },
            }),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: ['question', paperInstanceId],
            }),
    })
}
