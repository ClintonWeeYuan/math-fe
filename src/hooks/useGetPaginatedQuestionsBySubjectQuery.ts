import {
    keepPreviousData,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'

import { useEffect } from 'react'
import { getQuestionsBySubjectPaginatedQuestionsSubjectPaginatedSubjectIdGet } from '@/client'

type Props = {
    subjectId: string
    page: number
    size: number
    topics: string[]
    difficulty: string[]
    papers: string[]
    // Admin only — the backend ignores it for everyone else, who always see
    // published questions and nothing else.
    status?: 'draft' | 'published'
}

export default function useGetPaginatedQuestionsBySubjectQuery({
    subjectId,
    page,
    size,
    topics,
    difficulty,
    papers,
    status,
}: Props) {
    const queryClient = useQueryClient()

    const query = useQuery({
        queryFn: async () => {
            const token = localStorage.getItem('token') ?? ''

            return (
                await getQuestionsBySubjectPaginatedQuestionsSubjectPaginatedSubjectIdGet(
                    {
                        path: {
                            subject_id: subjectId,
                        },
                        query: {
                            page,
                            topics,
                            size,
                            difficulty,
                            papers,
                            status,
                        },
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )
            ).data
        },
        queryKey: [
            'questions',
            subjectId,
            { page, topics, difficulty, papers, status },
        ],
        refetchOnWindowFocus: false,
        staleTime: 60 * 60 * 1000,
        placeholderData: keepPreviousData,
    })

    const { data, isPlaceholderData } = query

    useEffect(() => {
        const totalPages = data != undefined ? data.total / data.size : 1

        if (!isPlaceholderData && page < totalPages) {
            queryClient.prefetchQuery({
                queryKey: [
                    'questions',
                    subjectId,
                    { page: page + 1, topics, difficulty },
                ],
                queryFn: async () =>
                    (
                        await getQuestionsBySubjectPaginatedQuestionsSubjectPaginatedSubjectIdGet(
                            {
                                path: {
                                    subject_id: subjectId,
                                },
                                query: {
                                    page,
                                    topics,
                                    size,
                                    difficulty,
                                },
                            }
                        )
                    ).data,
            })
        }
    }, [
        data,
        difficulty,
        isPlaceholderData,
        page,
        queryClient,
        size,
        subjectId,
        topics,
    ])

    return query
}
