import type { PublishedDiagnosticSet } from '@/client'
import type { DiagnosticTest } from '@/hooks/diagnostic/useListPublishedSetsQuery.ts'

/**
 * What to offer a student at the foot of their report.
 *
 * The report was a dead end: forty minutes of work, a page of findings, and
 * one "Back to home" button. Most students arrive on Mathematics 1 from the
 * guides, so the moment they finish is the moment they know least about what
 * else is here and are most inclined to find out.
 *
 * Pure, and separate from the component, because the ordering rules are the
 * part worth testing and none of them need React.
 */

/** A set is startable if a student can actually begin it. Paid sets 402 while
 *  billing is off, so offering one here would send a student who just did the
 *  work into a wall — worse than offering nothing. */
function startable(set: PublishedDiagnosticSet, billingLive: boolean): boolean {
    return set.isFree || billingLive
}

/** `format` is not in the generated client yet — same narrowing the catalogue
 *  uses. Absent, a set reads as a full paper, which is the pre-mini behaviour. */
function isMiniSet(set: PublishedDiagnosticSet): boolean {
    return (set as { format?: 'mini' | 'full' }).format === 'mini'
}

/**
 * Which admissions test a subject belongs to.
 *
 * Subjects are stored prefixed ("ESAT Math 1", "TMUA Paper 1") and the
 * catalogue endpoint filters on exactly that prefix, so reading the test off
 * the subject here agrees with the server rather than duplicating a mapping
 * that could drift from it.
 */
export function testFromSubject(
    subject: string | null | undefined
): DiagnosticTest | undefined {
    const s = subject?.trim().toUpperCase()
    if (s?.startsWith('ESAT')) return 'esat'
    if (s?.startsWith('TMUA')) return 'tmua'
    return undefined
}

export type NextSteps = {
    /** The full paper for the subject just sat — only after a mini, where the
     *  report itself says the radar needs a longer paper. */
    sameSubject?: PublishedDiagnosticSet
    /** One set per other subject in the same test. */
    otherSubjects: PublishedDiagnosticSet[]
}

/**
 * Pick the next diagnostics to put in front of a student.
 *
 * Two different suggestions, in priority order:
 *
 * 1. After a mini, the full paper of the same subject. The mini's report
 *    already tells them their radar needs a longer paper; not linking one is
 *    the gap this closes. It comes first because finishing a subject they
 *    have started beats sampling a new one.
 * 2. One set per other subject. The *shortest* startable set, because the ask
 *    at this point is a second commitment from someone who has just spent
 *    their attention — fifteen minutes is a far easier yes than forty, and
 *    the full paper is one click further on from there.
 *
 * Subjects keep the order the catalogue returned them in, which is
 * alphabetical. Ranking them by usefulness would mean guessing at a course we
 * never asked for — Cambridge Engineering needs Maths 2 and Physics where
 * Imperial Life Sciences needs Chemistry and Biology, and a confident wrong
 * order is worse than an obviously neutral one. The component says which
 * modules a course needs is on the guide, and links it.
 */
export function nextStepsFor({
    subject,
    sets,
    currentSetId,
    isMini,
    billingLive,
    completedSubjects,
}: {
    subject: string | null | undefined
    sets: PublishedDiagnosticSet[] | undefined
    currentSetId: string
    isMini: boolean
    billingLive: boolean
    /** Subjects this student has already finished a paper in, so they are not
     *  offered again. Undefined means we do not know — see below. */
    completedSubjects?: Set<string>
}): NextSteps {
    const available = (sets ?? []).filter(
        (s) => startable(s, billingLive) && s.id !== currentSetId
    )

    const sameSubject = isMini
        ? available.find((s) => s.subject === subject && !isMiniSet(s))
        : undefined

    const shortestBySubject = new Map<string, PublishedDiagnosticSet>()
    for (const set of available) {
        if (!set.subject || set.subject === subject) continue
        // Already done it — recommending it again wastes the one slot that
        // could have shown them something new. Fails open by construction: if
        // the attempt list did not load, completedSubjects is undefined and
        // every module is offered, which is the pre-existing behaviour and the
        // right way to be wrong.
        if (completedSubjects?.has(set.subject)) continue
        const held = shortestBySubject.get(set.subject)
        if (held === undefined || set.timeLimitMinutes < held.timeLimitMinutes) {
            shortestBySubject.set(set.subject, set)
        }
    }

    return { sameSubject, otherSubjects: [...shortestBySubject.values()] }
}
