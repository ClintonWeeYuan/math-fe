import { client } from '@/client/client.gen'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { toDiagnosticApiError } from '@/lib/diagnosticApiError.ts'

/**
 * Redemption questions: the shapes the backend sends, the two calls, and the
 * copy helpers the three screens share.
 *
 * Typed by hand rather than through the generated client, for the reason
 * every recent endpoint is: regenerating that client rewrites ~1500 lines,
 * which is a change of its own. The field names mirror
 * app/models/diagnostic.py in camelCase.
 */

export type RedemptionReason = 'wrong' | 'blank' | 'slow'
export type RedemptionOutcomeKind = 'redeemed' | 'requeued' | 'retired'

export type RedemptionQueuedItem = {
    questionId: string
    questionOrderIndex: number
    reason: RedemptionReason
    originalSeconds: number
}

/** What one full paper put in the queue — on that paper's report. */
export type RedemptionQueuedSummary = {
    count: number
    wrongCount: number
    blankCount: number
    slowCount: number
    availableFrom?: string | null
    items: RedemptionQueuedItem[]
}

/** One question's result on a redemption sitting — on that sitting's report. */
export type RedemptionOutcome = {
    questionId: string
    questionOrderIndex: number
    sourceOrderIndex: number
    reason: RedemptionReason
    cycle: number
    originalSeconds: number
    redeemedSeconds?: number | null
    isCorrect?: boolean | null
    outcome?: RedemptionOutcomeKind | null
    nextAvailableFrom?: string | null
}

/** A student's queued questions from one paper — on the results page. */
export type RedemptionGroup = {
    sourceSetId: string
    title: string
    subject?: string | null
    isFree: boolean
    questionCount: number
    wrongCount: number
    blankCount: number
    slowCount: number
    readyCount: number
    batchSize: number
    batchMinutes: number
    unlocksAt?: string | null
    latestSourceSubmittedAt: string
    pendingSetId?: string | null
    pendingAttemptId?: string | null
}

export const REDEMPTION_QUEUE_QUERY_KEY = ['redemption-queue'] as const

export async function fetchRedemptionQueue(): Promise<RedemptionGroup[]> {
    const result = await client.get<{ 200: { groups: RedemptionGroup[] } }>({
        url: '/diagnostic/redemption',
        headers: getAuthHeaders(),
    })
    if (result.error !== undefined) {
        throw toDiagnosticApiError(result, 'Could not load your redemption questions.')
    }
    return result.data?.groups ?? []
}

export async function buildRedemptionSet(sourceSetId: string): Promise<{
    setId: string
    questionCount: number
    timeLimitMinutes: number
}> {
    const result = await client.post<{
        201: { setId: string; questionCount: number; timeLimitMinutes: number }
    }>({
        url: '/diagnostic/redemption/sets',
        body: { sourceSetId },
        headers: getAuthHeaders(),
    })
    if (result.error !== undefined || result.data === undefined) {
        throw toDiagnosticApiError(result, 'Could not build your redemption round.')
    }
    return result.data
}

// ---------------------------------------------------------------------------
// Copy helpers. Pure, so the wording is testable without rendering.

/** "4 min 10 s", "45 s". Spent time reads as words here, not as a clock:
 *  the pacing curve's m:ss is for comparing bars, this is for a sentence. */
export function formatSpent(seconds: number): string {
    const safe = Math.max(0, Math.round(seconds))
    const minutes = Math.floor(safe / 60)
    const rest = safe % 60
    if (minutes === 0) return `${rest} s`
    return `${minutes} min ${rest.toString().padStart(2, '0')} s`
}

/** "Saturday 17 October" */
export function formatUnlockDay(iso: string | null | undefined): string {
    if (!iso) return 'soon'
    return new Date(iso).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    })
}

/** "Sat 17 Oct" */
export function formatUnlockShort(iso: string | null | undefined): string {
    if (!iso) return 'soon'
    return new Date(iso).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    })
}

/** "10 October" */
export function formatPaperDate(iso: string | null | undefined): string {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
    })
}

const SMALL_WORDS = [
    'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
    'nine', 'ten',
]

/** "Four", "11" — a count at the start of a sentence. */
export function countWord(n: number): string {
    const word = SMALL_WORDS[n]
    return word ? word[0].toUpperCase() + word.slice(1) : String(n)
}

function plural(n: number, one: string, many = `${one}s`): string {
    return `${n} ${n === 1 ? one : many}`
}

function joinParts(parts: string[]): string {
    if (parts.length <= 1) return parts.join('')
    return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
}

/** The report card's first line. */
export function queuedSentence(q: RedemptionQueuedSummary): string {
    const parts: string[] = []
    if (q.wrongCount > 0) parts.push(`${q.wrongCount} you got wrong`)
    if (q.blankCount > 0) parts.push(`${q.blankCount} you left blank`)
    if (q.slowCount > 0) parts.push(`${q.slowCount} that took a while`)
    return `We've kept ${plural(q.count, 'question')} from this paper for you to try again: ${joinParts(parts)}.`
}

/** "Q3 · wrong", "Q12 · left blank", "Q14 · 4 min 10 s" */
export function queuedChip(item: RedemptionQueuedItem): string {
    const label = `Q${item.questionOrderIndex + 1}`
    if (item.reason === 'wrong') return `${label} · wrong`
    if (item.reason === 'blank') return `${label} · left blank`
    return `${label} · ${formatSpent(item.originalSeconds)}`
}

/** "4 wrong", "1 left blank", "2 slow" — the results card's chips. */
export function groupChips(g: RedemptionGroup): string[] {
    const chips: string[] = []
    if (g.wrongCount > 0) chips.push(`${g.wrongCount} wrong`)
    if (g.blankCount > 0) chips.push(`${g.blankCount} left blank`)
    if (g.slowCount > 0) chips.push(`${g.slowCount} slow`)
    return chips
}

/** "6 questions · 9 min · from your paper on 10 October", or the capped
 *  variant when the queue holds more than one sitting's worth. */
export function groupMeta(g: RedemptionGroup): string {
    const from = `from your paper on ${formatPaperDate(g.latestSourceSubmittedAt)}`
    if (g.readyCount > g.batchSize && g.batchSize > 0) {
        const rest = g.readyCount - g.batchSize
        return `${plural(g.questionCount, 'question')} · first ${g.batchSize} in ${g.batchMinutes} min, ${rest} more will wait · ${from}`
    }
    if (g.batchSize > 0) {
        return `${plural(g.questionCount, 'question')} · ${g.batchMinutes} min · ${from}`
    }
    return `${plural(g.questionCount, 'question')} · ${from}`
}

/** The results card's button. */
export function groupAction(g: RedemptionGroup): string {
    if (g.readyCount > g.batchSize) return `Redeem the first ${g.batchSize} →`
    return `Redeem ${plural(g.batchSize, 'question')} →`
}

export type OutcomeStatus = 'Redeemed' | 'Not yet' | 'Retired'

export function outcomeStatus(o: RedemptionOutcome): OutcomeStatus {
    if (o.outcome === 'redeemed') return 'Redeemed'
    if (o.outcome === 'retired') return 'Retired'
    return 'Not yet'
}

/** The sentence beside each question on a redemption report. */
export function outcomeDetail(o: RedemptionOutcome): string {
    const spent =
        o.redeemedSeconds !== null && o.redeemedSeconds !== undefined
            ? formatSpent(o.redeemedSeconds)
            : null
    if (o.outcome === 'redeemed') {
        const base = spent ? `Right, in ${spent}` : 'Right, and on pace'
        return o.reason === 'slow' ? `${base} · was ${formatSpent(o.originalSeconds)}` : base
    }
    if (o.outcome === 'retired') {
        return "Missed twice · worth going through with a teacher. It's in your review below."
    }
    const next = o.nextAvailableFrom
        ? ` · back in the queue, ready ${formatPaperDate(o.nextAvailableFrom)}`
        : ''
    if (o.isCorrect === true) {
        return `Right, but ${spent ?? 'slow'}${next}`
    }
    if (o.isCorrect === false) {
        return `${o.reason === 'wrong' ? 'Wrong again' : 'Wrong this time'}${next}`
    }
    return `Left blank${next}`
}

/** "4 of 6 redeemed" */
export function outcomeHeadline(outcomes: RedemptionOutcome[]): string {
    const redeemed = outcomes.filter((o) => o.outcome === 'redeemed').length
    return `${redeemed} of ${outcomes.length} redeemed`
}

/** The line under the list. */
export function outcomeClosing(outcomes: RedemptionOutcome[]): string {
    const n = outcomes.length
    const redeemed = outcomes.filter((o) => o.outcome === 'redeemed').length
    const requeued = outcomes.filter((o) => o.outcome === 'requeued').length
    const retired = outcomes.filter((o) => o.outcome === 'retired').length
    if (n > 0 && redeemed === n) {
        return `All ${n} redeemed. That's the paper's hardest questions for you, done at pace.`
    }
    if (requeued > 0) {
        return `${countWord(redeemed)} down. The ${requeued === 1 ? 'one' : requeued} going back in the queue will come round again on the date beside each — read the worked solutions below while they're fresh.`
    }
    if (retired > 0) {
        return `${countWord(redeemed)} down. The rest are retired — worth a session with a teacher. Their worked solutions are below.`
    }
    return `${countWord(redeemed)} down.`
}
