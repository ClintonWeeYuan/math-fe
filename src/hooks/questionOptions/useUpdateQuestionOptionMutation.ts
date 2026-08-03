import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateOptionQuestionsQuestionIdOptionOptionIdPatch } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

type Props = {
    questionId: string
}

type MutationFunctionProps = {
    optionValue: string
    isCorrect: boolean
    optionId: string
}

export default function useUpdateQuestionOptionMutation({ questionId }: Props) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            optionValue,
            isCorrect,
            optionId,
        }: MutationFunctionProps) =>
            (
                await updateOptionQuestionsQuestionIdOptionOptionIdPatch({
                headers: getAuthHeaders(),
                    path: {
                        question_id: questionId,
                        option_id: optionId,
                    },
                    body: {
                        isCorrect,
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
