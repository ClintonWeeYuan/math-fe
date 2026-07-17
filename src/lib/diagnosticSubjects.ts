/**
 * The subjects a diagnostic set can belong to.
 *
 * Deliberately a frontend list, not a DB enum or a backend constant: the
 * column is plain `text` (see migration 20260713080000) precisely so adding
 * a paper is a product decision, not a migration. These are the known
 * values offered in the UI; the subject input still accepts a new one typed
 * in, so this list never blocks anyone.
 */
export const DIAGNOSTIC_SUBJECTS = [
    'ESAT Maths I',
    'ESAT Maths II',
    'ESAT Physics',
] as const

/** Label for a set whose subject is null — not a guess, just absence. */
export const UNCATEGORISED_LABEL = 'Uncategorised'

type HasSubject = { subject?: string | null }

/**
 * Groups sets under subject headings for the admin list.
 *
 * Ordering is deliberate: the known subjects first, in DIAGNOSTIC_SUBJECTS
 * order (so the list reads the same every visit rather than reshuffling as
 * sets are added), then any subject typed in that isn't in that list
 * (alphabetical), then Uncategorised last — absence belongs at the bottom,
 * not interleaved. A known subject with no sets yet is still shown, so an
 * empty "ESAT Physics" heading tells you it's empty rather than the subject
 * silently not existing.
 */
export function groupSetsBySubject<T extends HasSubject>(
    sets: T[]
): Array<{ subject: string; sets: T[] }> {
    const known = DIAGNOSTIC_SUBJECTS.map((subject) => ({
        subject,
        sets: sets.filter((s) => s.subject === subject),
    }))

    const knownNames = new Set<string>(DIAGNOSTIC_SUBJECTS)
    const customNames = [
        ...new Set(
            sets
                .map((s) => s.subject)
                .filter((s): s is string => !!s && !knownNames.has(s))
        ),
    ].sort()
    const custom = customNames.map((subject) => ({
        subject,
        sets: sets.filter((s) => s.subject === subject),
    }))

    const uncategorised = sets.filter((s) => !s.subject)
    return [
        ...known,
        ...custom,
        ...(uncategorised.length > 0
            ? [{ subject: UNCATEGORISED_LABEL, sets: uncategorised }]
            : []),
    ]
}
