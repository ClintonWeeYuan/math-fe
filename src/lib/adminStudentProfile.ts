import type { AdminAttemptResultRow } from '@/client'

/**
 * What a student told us about themselves, read off an admin results row.
 *
 * These six fields are not in the generated client yet, for the same reason
 * `isInternal` is not: regenerating rewrites all ~1500 lines of it with a
 * newer generator, which is a change of its own and does not belong in the one
 * that adds six columns. Narrowed here rather than at each call site so the
 * page and the CSV cannot disagree about the shape.
 *
 * Every field is optional, and absent for two different reasons worth keeping
 * apart when reading the table: name, school, level and state are asked at
 * signup, so they are missing only for an account that predates the form;
 * testSitting and targetUniversities come from the survey after a first paper,
 * so they are missing for anyone who has not finished one — which, on an
 * in-progress row, is most people. Neither is an error.
 */
export type StudentProfile = {
    studentName?: string | null
    school?: string | null
    level?: string | null
    state?: string | null
    testSitting?: string | null
    targetUniversities?: string[] | null
}

export function profileOf(row: AdminAttemptResultRow): StudentProfile {
    return row as StudentProfile
}

/** The three sitting values the survey can store, as a person would read them.
 *  An unrecognised value is shown as-is rather than blanked: a sitting added to
 *  the database before this map is a fact about a student, not a bug to hide. */
const SITTING_LABELS: Record<string, string> = {
    october_2026: 'October 2026',
    january_2027: 'January 2027',
    undecided: 'Not decided',
}

export function sittingLabel(sitting: string | null | undefined): string {
    if (!sitting) return '—'
    return SITTING_LABELS[sitting] ?? sitting
}

/** Target universities as one cell. Empty and absent both read as a dash —
 *  neither means anything different to someone scanning the column. */
export function universitiesLabel(
    universities: string[] | null | undefined
): string {
    if (!universities || universities.length === 0) return '—'
    return universities.join(', ')
}
