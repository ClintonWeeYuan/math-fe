import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createOptionQuestionsQuestionIdOptionPost } from '@/client'

type Props = {
    questionId: string
}

type MutationFunctionProps = {
    optionValue: string
}

export default function useAddQuestionOptionMutation({ questionId }: Props) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ optionValue }: MutationFunctionProps) =>
            (
                await createOptionQuestionsQuestionIdOptionPost({
                    path: {
                        question_id: questionId,
                    },
                    body: {
                        isCorrect: false,
                        value: optionValue,
                    },
                })
            ).data,
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: ['options', questionId],
            }),
    })
}
