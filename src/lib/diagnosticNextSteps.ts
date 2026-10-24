import type { PublishedDiagnosticSet } from '@/client'
import { isSinglePaper } from '@/lib/singlePapers.ts'
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

/** "ESAT Physics — Diagnostic Set C" → "C"; anything unrecognised keeps its
 *  whole title, so a set named differently still sorts somewhere sensible. */
export function setLetter(set: PublishedDiagnosticSet): string {
    return set.title.match(/Set\s+([A-Z0-9]+)\s*$/i)?.[1] ?? set.title
}

/** Full papers in paper order (A, B, C …), whatever order the catalogue
 *  returned them in. Single papers are left out: they reuse the lettered
 *  sets' questions, so they are never the next paper to suggest. */
function fullPapersInOrder(sets: PublishedDiagnosticSet[]): PublishedDiagnosticSet[] {
    return sets
        .filter((s) => !isMiniSet(s) && !isSinglePaper(s))
        .sort((a, b) =>
            setLetter(a).localeCompare(setLetter(b), undefined, { numeric: true })
        )
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
    /** The next full paper in the subject just sat. After a mini, because the
     *  report itself says the radar needs a longer paper; and for a Season
     *  Pass holder after any paper, because the next paper is what they paid
     *  for. Never one they have already sat. */
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
 * A Season Pass holder is a different student. They have already made the
 * commitment, and what they bought is the full papers. Steering them to the
 * free Mini and Set A of each module — what the rules above do — is how buyers
 * in October 2026 spent their first week on papers they could have sat for
 * nothing. So for them: the next paper they have not sat in this module
 * first, after any paper, and then the next unsat full paper in each other
 * module. A module they have sat every paper of is not offered.
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
    satSetIds,
    holdsPass = false,
}: {
    subject: string | null | undefined
    sets: PublishedDiagnosticSet[] | undefined
    currentSetId: string
    isMini: boolean
    billingLive: boolean
    /** Subjects this student has already finished a paper in, so they are not
     *  offered again. Undefined means we do not know — see below. */
    completedSubjects?: Set<string>
    /** Sets this student has already sat, so none is offered again. Undefined
     *  means we do not know, and nothing is subtracted. */
    satSetIds?: Set<string>
    /** Whether they hold a Season Pass for this subject's test. */
    holdsPass?: boolean
}): NextSteps {
    const available = (sets ?? []).filter(
        (s) => startable(s, billingLive) && s.id !== currentSetId
    )
    const unsat = (s: PublishedDiagnosticSet) => !satSetIds?.has(s.id)
    const nextPaperIn = (subj: string | null | undefined) =>
        fullPapersInOrder(available.filter((s) => s.subject === subj)).find(unsat)

    const sameSubject = isMini || holdsPass ? nextPaperIn(subject) : undefined

    if (holdsPass) {
        const others: PublishedDiagnosticSet[] = []
        const seen = new Set<string>()
        for (const set of available) {
            if (!set.subject || set.subject === subject || seen.has(set.subject)) continue
            seen.add(set.subject)
            const next = nextPaperIn(set.subject)
            if (next) others.push(next)
        }
        return { sameSubject, otherSubjects: others }
    }

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
