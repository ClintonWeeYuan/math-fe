import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteOptionQuestionsQuestionIdOptionOptionIdDelete } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

type Props = {
    questionId: string
}

type MutationFunctionProps = {
    optionId: string
}

export default function useRemoveQuestionOptionMutation({ questionId }: Props) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ optionId }: MutationFunctionProps) =>
            (
                await deleteOptionQuestionsQuestionIdOptionOptionIdDelete({
                headers: getAuthHeaders(),
                    path: {
                        question_id: questionId,
                        option_id: optionId,
                    },
                })
            ).data,
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: ['options', questionId],
            }),
    })
}
