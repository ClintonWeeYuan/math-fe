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
    /**
     * Ask for unpublished questions too. Admin only, and permitted rather than
     * granted: without it even an admin sees exactly what a student sees, so
     * the student bank is a truthful preview of the student bank.
     */
    includeDrafts?: boolean
}

export default function useGetPaginatedQuestionsBySubjectQuery({
    subjectId,
    page,
    size,
    topics,
    difficulty,
    papers,
    status,
    includeDrafts,
}: Props) {
    const queryClient = useQueryClient()

    const query = useQuery({
        queryFn: async () => {
            const token = localStorage.getItem('token') ?? ''

            const result =
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
                            includeDrafts,
                        },
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )
            // The generated client resolves { data: undefined, error } instead
            // of throwing, so returning `.data` blindly turned a failed request
            // into a successful empty page. A 500 on the admin's question list
            // rendered as "No questions yet" — the most misleading thing it
            // could have said, right after importing 40 of them.
            if (result.error !== undefined || result.data === undefined) {
                throw new Error('Could not load questions.')
            }
            return result.data
        },
        // Every input that changes the response belongs in the key. `size`
        // was missing, and two components on the admin subject page ask the
        // same question at different sizes: the publish card wants a count
        // (size 1, status published) and the review list wants the questions
        // (size 20, same status). Identical keys, so whichever landed first
        // won — the review list showed the publish card's single row and
        // reported "1 published question" when there were five.
        queryKey: [
            'questions',
            subjectId,
            { page, size, topics, difficulty, papers, status, includeDrafts },
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
                // Same shape as the key above, or the prefetch warms a key
                // nothing ever reads — this one omitted papers and status
                // entirely, so it was writing somewhere unreachable.
                queryKey: [
                    'questions',
                    subjectId,
                    {
                        page: page + 1,
                        size,
                        topics,
                        difficulty,
                        papers,
                        status,
                        includeDrafts,
                    },
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
