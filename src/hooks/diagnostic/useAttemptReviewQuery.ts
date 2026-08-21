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
    solutionDiagramSvg?: string | null
}

export type AttemptReview = {
    attemptId: string
    subject?: string | null
    questions: ReviewQuestion[]
}

/**
 * Carries the HTTP status, following AttemptReportError's precedent, so the
 * caller can tell a refusal from a breakage.
 *
 * That distinction is not cosmetic. Treating every failure the same is how a
 * backend deploy that had not happened yet looked exactly like a paper with no
 * worked solutions: the section rendered nothing, which is correct for a
 * refusal and badly wrong for a 404.
 */
export class AttemptReviewError extends Error {
    status?: number
    constructor(status?: number) {
        super(`Failed to load review${status ? ` (${status})` : ''}`)
        this.name = 'AttemptReviewError'
        this.status = status
    }
}

/** A refusal the student can do nothing about and should not be told about:
 *  409 the attempt is still in progress, 403 it is not theirs, 401 they are
 *  signed out. Nothing to show, and nothing has gone wrong. */
export function isExpectedRefusal(error: unknown): boolean {
    const status = (error as AttemptReviewError | undefined)?.status
    return status === 401 || status === 403 || status === 409
}

/**
 * The per-question review of a finished attempt.
 *
 * No retry. The endpoint's refusals are answers, not failures, and hammering
 * them would only delay the section disappearing, which is what should happen.
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
                throw new AttemptReviewError(result.response?.status)
            }
            return result.data
        },
    })
}
