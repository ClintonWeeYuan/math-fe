import { client } from '@/client/client.gen'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { toDiagnosticApiError } from '@/lib/diagnosticApiError.ts'

/**
 * The Season Pass tracker's one call, hand-written against the generic client
 * for the same reason billingApi.ts is: regenerating the SDK rewrites all of
 * it. The endpoint is in the committed openapi.json, so move to the generated
 * method the next time the client is regenerated.
 */

export type AttemptStatus = 'in_progress' | 'submitted' | 'timed_out' | 'abandoned'

export type HeldPass = {
    product: string
    label: string
    /** "esat" | "tmua", or null for a legacy comp that opens every test. */
    test: string | null
    /** "stripe" | "comp" | "agent". */
    source: string
    purchasedAt: string | null
    expiresAt: string | null
    isLive: boolean
    stripeSessionId: string | null
}

export type PaperProgress = {
    setId: string
    title: string | null
    subject: string | null
    test: string | null
    isFree: boolean
    format: string | null
    questionCount: number
    attemptCount: number
    latestAttemptId: string | null
    latestStatus: AttemptStatus | null
    latestScore: number | null
    latestAnswered: number
    latestStartedAt: string | null
    bestScore: number | null
}

export type SeasonPassHolder = {
    studentId: string
    email: string | null
    name: string | null
    school: string | null
    testSitting: string | null
    isInternal: boolean
    passes: HeldPass[]
    papers: PaperProgress[]
    papersCompleted: number
    paidPapersTotal: number
    paidPapersCompleted: number
    lastActiveAt: string | null
}

export async function fetchSeasonPassHolders(): Promise<SeasonPassHolder[]> {
    const result = await client.get({
        url: '/admin/season-passes',
        headers: getAuthHeaders(),
    })
    if (result.error !== undefined) {
        throw toDiagnosticApiError(result, 'Could not load Season Pass holders.')
    }
    return (result.data as { holders: SeasonPassHolder[] }).holders
}
