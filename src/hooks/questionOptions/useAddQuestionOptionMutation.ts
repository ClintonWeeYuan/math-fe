import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createOptionQuestionsQuestionIdOptionPost } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

type Props = {
    questionId: string
}

type MutationFunctionProps = {
    optionValue: string
    position: number
}

export default function useAddQuestionOptionMutation({ questionId }: Props) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ optionValue, position }: MutationFunctionProps) =>
            (
                await createOptionQuestionsQuestionIdOptionPost({
                headers: getAuthHeaders(),
                    path: {
                        question_id: questionId,
                    },
                    body: {
                        isCorrect: false,
                        value: optionValue,
                        position,
                    },
                })
            ).data,
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: ['options', questionId],
            }),
    })
}
