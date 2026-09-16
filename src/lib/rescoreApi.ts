import { client } from '@/client/client.gen'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { toDiagnosticApiError } from '@/lib/diagnosticApiError.ts'

/**
 * Re-marking past attempts after a question's answer key is corrected.
 * Hand-written against the generic client, like billingApi.ts.
 */

export type RescoreRow = {
    attemptId: string
    studentEmail: string | null
    isInternal: boolean
    setTitle: string | null
    selectedOption: string | null
    storedIsCorrect: boolean | null
    newIsCorrect: boolean | null
    totalScore: number | null
    newTotalScore: number | null
}

export type RescorePreview = {
    questionId: string
    correctOption: string | null
    answeredAttempts: number
    inProgressAttempts: number
    gains: number
    losses: number
    rows: RescoreRow[]
}

export type RescoreApplied = {
    rescored: number
    results: {
        attemptId: string
        totalScoreBefore: number | null
        totalScoreAfter: number | null
    }[]
}

export async function fetchRescorePreview(questionId: string): Promise<RescorePreview> {
    const result = await client.get({
        url: `/diagnostic/admin/questions/${questionId}/rescore`,
        headers: getAuthHeaders(),
    })
    if (result.error !== undefined) {
        throw toDiagnosticApiError(result, 'Could not check past marks for this question.')
    }
    return result.data as RescorePreview
}

export async function applyRescore(questionId: string): Promise<RescoreApplied> {
    const result = await client.post({
        url: `/diagnostic/admin/questions/${questionId}/rescore`,
        headers: getAuthHeaders(),
    })
    if (result.error !== undefined) {
        throw toDiagnosticApiError(result, 'Could not re-score past attempts.')
    }
    return result.data as RescoreApplied
}
