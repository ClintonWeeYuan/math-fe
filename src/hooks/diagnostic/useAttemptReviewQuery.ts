import { useQuery } from '@tanstack/react-query'
import { client } from '@/client/client.gen'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

/** Shapes hand-written because the generated client has not been regenerated
 *  for this endpoint — same reason as the attempts list. */
export type ReviewOption = {
    label: string
    text: string
    isCorrect: boolean
    isSelected: boolean
    misconception?: string | null
}

export type ReviewQuestion = {
    questionId: string
    questionOrderIndex: number
    stem: string
    diagramUrl?: string | null
    options: ReviewOption[]
    correctOption: string
    selectedOption?: string | null
    isCorrect?: boolean | null
    solutionText?: string | null
    solutionVideoUrl?: string | null
}

export type AttemptReview = {
    attemptId: string
    subject?: string | null
    questions: ReviewQuestion[]
}

/**
 * The per-question review of a finished attempt.
 *
 * No retry. The endpoint's refusals — 403 on an attempt still in progress or
 * one that is not yours — are answers, not failures, and hammering them would
 * only delay the section quietly disappearing, which is what should happen.
 */
export default function useAttemptReviewQuery({
    attemptId,
}: {
    attemptId: string
}) {
    return useQuery({
        queryKey: ['diagnostic-attempt-review', attemptId],
        enabled: attemptId.length > 0,
        retry: false,
        queryFn: async (): Promise<AttemptReview> => {
            const result = await client.get<{ 200: AttemptReview }>({
                url: `/diagnostic/attempts/${attemptId}/review`,
                headers: getAuthHeaders(),
            })
            if (result.error !== undefined || result.data === undefined) {
                throw new Error('Review is not available for this attempt.')
            }
            return result.data
        },
    })
}
