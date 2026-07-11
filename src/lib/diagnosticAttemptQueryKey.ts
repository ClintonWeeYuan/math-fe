/**
 * The single query key for an attempt's full state (attempt + questions +
 * responses), as returned by GET /diagnostic/attempts/{id}. Every part of
 * the exam screen — navigator, question pane, timer (PR 2), event capture
 * (PR 3) — reads from this one cache entry so nothing can drift; the
 * optimistic answer/flag write patches this same entry. One helper so the
 * key is spelled identically everywhere (a typo'd key is a silent
 * second-source-of-truth bug).
 */
export function diagnosticAttemptQueryKey(attemptId: string): [string, string] {
    return ['diagnostic-attempt', attemptId]
}
