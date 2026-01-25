import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteQuestionQuestionsQuestionIdDelete } from '@/client'

type Props = { paperInstanceId: string }

export default function useDeleteQuestionMutation({ paperInstanceId }: Props) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (questionId: string) =>
            await deleteQuestionQuestionsQuestionIdDelete({
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
