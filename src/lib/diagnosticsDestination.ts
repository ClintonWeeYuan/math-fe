import type { DiagnosticTest } from '@/hooks/diagnostic/useListPublishedSetsQuery.ts'

/** The tests that have a catalogue page of their own. */
const TESTS: readonly DiagnosticTest[] = ['esat', 'tmua']

/**
 * Which diagnostics catalogue to send a student to.
 *
 * Passes are sold per test, so "browse the papers" has a different answer for
 * a TMUA holder than for an ESAT one. Sending everybody to the combined
 * listing looked neutral but was not: the combined page opens with the five
 * ESAT subjects, so a student who had just bought TMUA landed on a screenful
 * of papers their pass does not open and had to scroll past all of them to
 * reach the two they had paid for. It reads as having bought the wrong thing.
 *
 * Exactly one covered test means that test's page. Both, or none, means the
 * combined listing — with both there is no single right answer, and with none
 * there is nothing to narrow to.
 */
export function diagnosticsPathFor(
    coveredTests: readonly string[] | undefined
): string {
    const covered = TESTS.filter((test) => coveredTests?.includes(test))
    return covered.length === 1 ? `/diagnostics/${covered[0]}` : '/diagnostics'
}

/**
 * How to describe what a pass just unlocked.
 *
 * "Every paper is open" is false for a single-test pass and is exactly the
 * sentence a TMUA buyer would read immediately before finding ESAT papers
 * locked.
 */
export function unlockedLabel(
    coveredTests: readonly string[] | undefined
): string {
    const covered = TESTS.filter((test) => coveredTests?.includes(test))
    if (covered.length !== 1) return 'Every paper is open'
    return covered[0] === 'esat'
        ? 'Every ESAT paper is open'
        : 'Every TMUA paper is open'
}
