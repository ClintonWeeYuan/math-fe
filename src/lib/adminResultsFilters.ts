import type { AdminAttemptResultRow } from '@/client'
import { testFromSubject } from '@/lib/diagnosticNextSteps.ts'

/**
 * Which bucket a result belongs to on the admin results page.
 *
 * 'other' exists because `testFromSubject` returns undefined for anything not
 * prefixed ESAT or TMUA. Today every subject is one or the other, but SPM
 * material is already in the codebase, and a row that matched neither would
 * otherwise vanish from both tabs while still being counted in the total —
 * numbers that don't reconcile are worse than an extra tab.
 */
export type ResultsTestKey = 'esat' | 'tmua' | 'other'

/** The special value meaning "don't narrow on this dimension". Not a real
 *  subject or set id, so it can never collide with one. */
export const ANY = 'all' as const

export type ResultsFilters = {
    test: ResultsTestKey | typeof ANY
    subject: string | typeof ANY
    setId: string | typeof ANY
}

export const NO_FILTERS: ResultsFilters = {
    test: ANY,
    subject: ANY,
    setId: ANY,
}

export function testKeyOf(row: AdminAttemptResultRow): ResultsTestKey {
    return testFromSubject(row.subject) ?? 'other'
}

export const TEST_LABEL: Record<ResultsTestKey, string> = {
    esat: 'ESAT',
    tmua: 'TMUA',
    other: 'Other',
}

/** Narrow rows by test, then subject, then set. Each dimension is independent,
 *  so an admin can hold a subject while flipping between tests — the page is
 *  responsible for clearing a selection the new test no longer contains. */
export function applyResultsFilters(
    rows: AdminAttemptResultRow[],
    filters: ResultsFilters
): AdminAttemptResultRow[] {
    return rows.filter((r) => {
        if (filters.test !== ANY && testKeyOf(r) !== filters.test) return false
        if (filters.subject !== ANY && (r.subject ?? '') !== filters.subject)
            return false
        if (filters.setId !== ANY && r.setId !== filters.setId) return false
        return true
    })
}

export type Counts = {
    /** Attempts, i.e. rows. One student sitting three papers counts three. */
    attempts: number
    /** Distinct students. The figure to quote when asked "how many people". */
    students: number
}

export function countsOf(rows: AdminAttemptResultRow[]): Counts {
    return {
        attempts: rows.length,
        students: new Set(rows.map((r) => r.studentId)).size,
    }
}

export type Facet = {
    value: string
    label: string
} & Counts

/**
 * The test tabs, in a fixed order so the page doesn't reshuffle as data
 * arrives, and omitting any bucket nobody has attempted — an empty TMUA tab
 * invites a click that shows nothing.
 */
export function testFacets(rows: AdminAttemptResultRow[]): Facet[] {
    const order: ResultsTestKey[] = ['esat', 'tmua', 'other']
    return order.flatMap((key) => {
        const inBucket = rows.filter((r) => testKeyOf(r) === key)
        if (inBucket.length === 0) return []
        return [{ value: key, label: TEST_LABEL[key], ...countsOf(inBucket) }]
    })
}

/**
 * Students who appear under more than one test.
 *
 * Without this the two tab counts read as a partition, and they are not: a
 * student sitting both an ESAT and a TMUA paper is counted in each, so the
 * halves can sum to more than the whole. Surfacing the overlap is the
 * difference between a number an admin can quote and one that misleads.
 */
export function studentsInBothTests(rows: AdminAttemptResultRow[]): number {
    const testsByStudent = new Map<string, Set<ResultsTestKey>>()
    for (const r of rows) {
        const seen = testsByStudent.get(r.studentId) ?? new Set<ResultsTestKey>()
        seen.add(testKeyOf(r))
        testsByStudent.set(r.studentId, seen)
    }
    let both = 0
    for (const seen of testsByStudent.values()) {
        if (seen.has('esat') && seen.has('tmua')) both += 1
    }
    return both
}

/** Distinct values of `pick` among rows, alphabetical, each with its counts.
 *  Rows missing the field are skipped rather than bucketed under '' — there is
 *  nothing useful to filter to, and a blank dropdown entry reads as a bug. */
function facetsBy(
    rows: AdminAttemptResultRow[],
    pick: (r: AdminAttemptResultRow) => { value: string; label: string } | null
): Facet[] {
    const groups = new Map<string, { label: string; rows: AdminAttemptResultRow[] }>()
    for (const r of rows) {
        const key = pick(r)
        if (!key) continue
        const group = groups.get(key.value) ?? { label: key.label, rows: [] }
        group.rows.push(r)
        groups.set(key.value, group)
    }
    return [...groups.entries()]
        .map(([value, g]) => ({ value, label: g.label, ...countsOf(g.rows) }))
        .sort((a, b) => a.label.localeCompare(b.label))
}

/** Subjects present once the test filter is applied, so choosing ESAT and then
 *  opening Subject offers only ESAT subjects. */
export function subjectFacets(
    rows: AdminAttemptResultRow[],
    test: ResultsTestKey | typeof ANY
): Facet[] {
    const scoped = applyResultsFilters(rows, { ...NO_FILTERS, test })
    return facetsBy(scoped, (r) =>
        r.subject ? { value: r.subject, label: r.subject } : null
    )
}

/** Sets present once test and subject are applied — this is the "which papers
 *  were actually sat" list. Labelled by title, keyed by id, because two sets
 *  could in principle share a title but never an id. */
export function setFacets(
    rows: AdminAttemptResultRow[],
    test: ResultsTestKey | typeof ANY,
    subject: string | typeof ANY
): Facet[] {
    const scoped = applyResultsFilters(rows, { ...NO_FILTERS, test, subject })
    return facetsBy(scoped, (r) =>
        r.setId ? { value: r.setId, label: r.setTitle ?? r.setId } : null
    )
}

/**
 * Drop any selection the new test no longer offers.
 *
 * Switching from ESAT to TMUA while "ESAT Physics" is selected would otherwise
 * leave an empty table with a filter bar that looks satisfied — the admin sees
 * "no results" and reads it as "nobody sat TMUA".
 */
export function reconcileFilters(
    rows: AdminAttemptResultRow[],
    next: ResultsFilters
): ResultsFilters {
    const subjects = subjectFacets(rows, next.test).map((f) => f.value)
    const subject =
        next.subject !== ANY && !subjects.includes(next.subject) ? ANY : next.subject
    const sets = setFacets(rows, next.test, subject).map((f) => f.value)
    const setId = next.setId !== ANY && !sets.includes(next.setId) ? ANY : next.setId
    return { test: next.test, subject, setId }
}
