import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
    type PaginatedQuestionResponse,
    setQuestionStatusQuestionsSetStatusPost,
} from '@/client'

export type QuestionFilters = {
    page: number
    topics: string[]
    difficulty: string[]
    subjectId: string
}

export default function useUpdateQuestionStatusMutation({
    page,
    topics,
    difficulty,
    subjectId,
}: QuestionFilters) {
    const queryClient = useQueryClient()
    const queryKey = ['questions', subjectId, { page, topics, difficulty }]

    return useMutation({
        mutationFn: async ({
            questionId,
            isCompleted,
        }: {
            questionId: string
            isCompleted: boolean
        }) => {
            const token = localStorage.getItem('token') ?? ''
            return await setQuestionStatusQuestionsSetStatusPost({
                query: {
                    question_id: questionId,
                    is_completed: isCompleted,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey })
            const previousQuestionResponse = queryClient.getQueryData(queryKey)

            queryClient.setQueryData<PaginatedQuestionResponse>(
                queryKey,
                (prev) => {
                    if (prev === undefined) {
                        return prev
                    }

                    return {
                        ...prev,
                        items: prev.items.map((item) => {
                            if (item.id === variables.questionId) {
                                return {
                                    ...item,
                                    status: variables.isCompleted
                                        ? 'COMPLETED'
                                        : 'NONE',
                                }
                            } else {
                                return item
                            }
                        }),
                    }
                }
            )

            return { previousQuestionResponse }
        },
        onError: (__, _, context) => {
            queryClient.setQueryData(
                queryKey,
                context?.previousQuestionResponse
            )
        },
    })
}
