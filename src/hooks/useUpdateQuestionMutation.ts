import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Difficulty } from '@/lib/types.ts'
import { updateQuestionQuestionsQuestionIdPatch } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

type Props = {
    questionId: string
    paperInstanceId: string
}

type MutationFunctionProps = {
    topicIds: string[]
    difficulty: Difficulty
    // Null for a bulk-imported question: it belongs to no past paper, so it has
    // no position in one to edit.
    number: number | null
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
                headers: getAuthHeaders(),
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
