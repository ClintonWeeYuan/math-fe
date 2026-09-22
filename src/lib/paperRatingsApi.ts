import { client } from '@/client/client.gen'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { toDiagnosticApiError } from '@/lib/diagnosticApiError.ts'

/**
 * What students said about each paper, from the card on their report
 * (PaperRating). Hand-written against the generic client, as
 * accommodationsApi.ts is, so regenerating the SDK cannot rewrite it.
 */

export type PaperRatings = {
    setId: string
    title: string
    subject?: string | null
    format: 'full' | 'mini' | string
    ratedAttempts: number
    feel: { tooEasy: number; aboutRight: number; tooHard: number }
    vsPastPapers: { easier: number; similar: number; harder: number; notTried: number }
}

export type PaperRatingsSummary = {
    papers: PaperRatings[]
    totalRatedAttempts: number
}

export async function fetchPaperRatings(): Promise<PaperRatingsSummary> {
    const result = await client.get({
        url: '/admin/paper-ratings',
        headers: getAuthHeaders(),
    })
    if (result.error !== undefined) {
        throw toDiagnosticApiError(result, 'Could not load paper ratings.')
    }
    return result.data as PaperRatingsSummary
}

/** Below this many ratings a split is a handful of opinions, not a verdict. */
export const FEW_RATINGS = 8
