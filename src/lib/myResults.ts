import type { PublishedDiagnosticSet } from '@/client'

/**
 * Turning a student's attempt history into the two things the results page
 * shows: a list they can act on, and a picture of what they have covered.
 *
 * Pure, and separate from the page, because the rules here are the part with
 * edges — what counts as completed, which of several attempts speaks for a
 * set, when a finished attempt is worth offering to retake — and none of them
 * need React to be tested.
 */

/** The shape GET /diagnostic/attempts returns, narrowed by hand because the
 *  generated client has not been regenerated (doing so rewrites ~1500 lines).
 *  Same approach the catalogue takes for `format`. */
export type StudentAttempt = {
    attemptId: string
    setId: string
    setTitle?: string | null
    subject?: string | null
    format?: string | null
    status: 'in_progress' | 'submitted' | 'timed_out' | 'abandoned'
    totalScore?: number | null
    answeredCount: number
    questionCount: number
    startedAt: string
    submittedAt?: string | null
    /** When this attempt's own review was first opened. */
    reviewedAt?: string | null
}

/**
 * What a student has done to one set.
 *
 * 'partial' exists because "completed" was being claimed for a paper answered
 * ten questions out of twenty-seven — the same terminal-is-not-sat confusion
 * the retake offer and the recommendations block already guard against. A
 * green Completed badge on a paper somebody barely started is the page
 * confidently telling them not to bother going back.
 */
export type Coverage =
    | 'completed'
    | 'partial'
    | 'in_progress'
    | 'not_attempted'

/**
 * How much of a set a student got through, 0–1.
 *
 * Used for the retake prompt rather than the score: someone who answered six
 * of twenty-seven has a report that cannot tell them much, and saying so is
 * more useful than showing them a mark out of 27 as though it meant something.
 */
export function completion(attempt: StudentAttempt): number {
    if (attempt.questionCount <= 0) return 0
    return attempt.answeredCount / attempt.questionCount
}

/** Below this, a terminal attempt is treated as not really a sitting — the
 *  report exists but rests on too little to be worth reading. */
export const LOW_COMPLETION = 0.5

export function isTerminal(attempt: StudentAttempt): boolean {
    return attempt.status === 'submitted' || attempt.status === 'timed_out'
}

/**
 * Which single attempt speaks for a set.
 *
 * A student may sit the same paper three times; the coverage view shows one
 * state per set, and the history below it keeps all three. Best score wins,
 * because coverage is asking "have you done this, and how did it go" and the
 * best sitting is the fairest answer to the second half.
 *
 * Ties break towards the earlier attempt. Two sittings at the same score are
 * the same evidence, and the first one is the one that was not informed by
 * having already seen the questions.
 */
/**
 * Was this attempt started after the student had already seen this set's
 * worked solutions?
 *
 * If so it is practice, not measurement. Worth doing, worth keeping in the
 * history, and not worth reporting as what they can do unaided — a score that
 * partly measures how well they remembered the answers is not the score the
 * coverage view is claiming to show.
 *
 * Compared against every *other* attempt at the same set, not this one's own
 * reviewedAt: reviewing your own paper afterwards is the intended behaviour
 * and taints nothing.
 */
export function isPracticeRetake(
    attempt: StudentAttempt,
    sameSetAttempts: StudentAttempt[]
): boolean {
    return sameSetAttempts.some(
        (other) =>
            other.attemptId !== attempt.attemptId &&
            other.reviewedAt != null &&
            other.reviewedAt < attempt.startedAt
    )
}

export function bestAttemptForSet(
    attempts: StudentAttempt[]
): StudentAttempt | undefined {
    const terminal = attempts.filter(isTerminal)
    if (terminal.length === 0) return undefined

    // Prefer attempts untainted by having already seen the answers. Only if
    // every sitting is a practice retake does one of those speak for the set —
    // showing nothing would be worse than showing a qualified number.
    const unaffected = terminal.filter((a) => !isPracticeRetake(a, attempts))
    const pool = unaffected.length > 0 ? unaffected : terminal

    return pool.reduce((best, candidate) => {
        const bestScore = best.totalScore ?? -1
        const score = candidate.totalScore ?? -1
        if (score > bestScore) return candidate
        if (score < bestScore) return best
        return candidate.startedAt < best.startedAt ? candidate : best
    })
}

/**
 * One row per published set in this test, with what the student has done to
 * it.
 *
 * Driven by the catalogue rather than by the attempt list, so a module a
 * student has never opened still appears — which is the entire point of a
 * coverage view, and the opposite of what grouping their attempts would give.
 */
export type CoverageRow = {
    set: PublishedDiagnosticSet
    state: Coverage
    /** The attempt that determined the state, where there is one. */
    attempt?: StudentAttempt
}

export function coverageFor({
    sets,
    attempts,
}: {
    sets: PublishedDiagnosticSet[] | undefined
    attempts: StudentAttempt[] | undefined
}): CoverageRow[] {
    const byStatus = new Map<string, StudentAttempt[]>()
    for (const attempt of attempts ?? []) {
        const list = byStatus.get(attempt.setId)
        if (list) list.push(attempt)
        else byStatus.set(attempt.setId, [attempt])
    }

    return (sets ?? []).map((set) => {
        const mine = byStatus.get(set.id) ?? []
        const best = bestAttemptForSet(mine)
        if (best) {
            // Same bar as actionFor and completedSubjects, so the badge, the
            // retake offer and the recommendations can never disagree about
            // whether this paper counts as sat.
            const state =
                completion(best) >= LOW_COMPLETION
                    ? ('completed' as const)
                    : ('partial' as const)
            return { set, state, attempt: best }
        }

        const open = mine.find((a) => a.status === 'in_progress')
        if (open) return { set, state: 'in_progress' as const, attempt: open }

        return { set, state: 'not_attempted' as const }
    })
}

/**
 * The subjects this student has finished at least one paper in.
 *
 * What the report's recommendations block subtracts, so it stops offering
 * modules they have already sat. Only terminal attempts count: an abandoned
 * paper is not a subject you have covered, and treating it as one would hide
 * the very module they most need to go back to.
 */
export function completedSubjects(
    attempts: StudentAttempt[] | undefined
): Set<string> {
    const done = new Set<string>()
    for (const attempt of attempts ?? []) {
        // Terminal is not enough. A paper that ran out of time at four
        // questions of twenty-seven has ended, but the student has not covered
        // that subject — and suppressing the recommendation would quietly
        // remove the module they most need to go back to. Same bar the history
        // row uses when it offers a retake instead of a report, so the two
        // cannot disagree about what counts as having sat something.
        if (
            isTerminal(attempt) &&
            completion(attempt) >= LOW_COMPLETION &&
            attempt.subject
        ) {
            done.add(attempt.subject)
        }
    }
    return done
}

/**
 * Not here, deliberately: a cross-attempt weakest-skills rollup.
 *
 * Skills live in each attempt's own report response, so summarising them
 * across attempts means either N report fetches or new aggregation — and this
 * page was scoped to use what already exists cheaply. Decided out of this
 * phase rather than forgotten.
 *
 * It is a prerequisite for the cross-module skills work, though: "you are weak
 * on the same skill in Physics and Chemistry" is the question that needs it,
 * and answering that properly wants a skills aggregate the report layer does
 * not currently produce. Build it there, once, rather than here per page.
 */

/** What to offer on a history row. */
export type AttemptAction = 'resume' | 'retake' | 'report'

export function actionFor(attempt: StudentAttempt): AttemptAction {
    if (attempt.status === 'in_progress') return 'resume'
    // A terminal attempt with barely any answers has a report, but not one
    // worth sending someone back to — the useful offer is another go.
    if (isTerminal(attempt) && completion(attempt) < LOW_COMPLETION) {
        return 'retake'
    }
    return 'report'
}


export type SubjectCoverage = {
    subject: string
    rows: CoverageRow[]
    /** Sets sat properly, out of those startable. Locked sets are excluded
     *  from both: "1 of 2" should not become "1 of 5" because three papers
     *  are behind a Season Pass nobody can buy yet. */
    sat: number
    startable: number
}

/**
 * Coverage grouped by module.
 *
 * The flat list was one card per set with the module name as its title, which
 * meant "Biology" appearing three times in a grid while its three sets sat in
 * different rows. Grouping restores the thing a student is actually asking —
 * "have I done Biology?" — and lets the sets underneath be compact rows rather
 * than cards competing for attention.
 */
export function groupCoverageBySubject(
    rows: CoverageRow[],
    { billingLive }: { billingLive: boolean }
): SubjectCoverage[] {
    const bySubject = new Map<string, CoverageRow[]>()
    for (const row of rows) {
        const subject = row.set.subject ?? 'Other'
        const list = bySubject.get(subject)
        if (list) list.push(row)
        else bySubject.set(subject, [row])
    }

    return [...bySubject.entries()].map(([subject, subjectRows]) => {
        const startable = subjectRows.filter((r) => r.set.isFree || billingLive)
        return {
            subject,
            rows: subjectRows,
            sat: startable.filter((r) => r.state === 'completed').length,
            startable: startable.length,
        }
    })
}
