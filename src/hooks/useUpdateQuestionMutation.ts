import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Difficulty } from '@/lib/types.ts'
import { updateQuestionQuestionsQuestionIdPatch } from '@/client'

type Props = {
    questionId: string
    paperInstanceId: string
}

type MutationFunctionProps = {
    topicIds: string[]
    difficulty: Difficulty
    number: number
    marks: number | null
}

export default function useUpdateQuestionMutation({
    questionId,
    paperInstanceId,
}: Props) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            difficulty,
            topicIds,
            number,
            marks,
        }: MutationFunctionProps) =>
            (
                await updateQuestionQuestionsQuestionIdPatch({
                    path: {
                        question_id: questionId,
                    },
                    body: {
                        difficulty,
                        topics: topicIds,
                        number,
                        marks,
                    },
                })
            ).data,
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: ['question', paperInstanceId],
            }),
    })
}
