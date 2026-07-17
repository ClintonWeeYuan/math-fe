import type { DiagnosticQuestionResponse } from '@/client'

/**
 * Pure logic for the question picker — filtering the available list and
 * reordering the chosen one — kept out of the component so it's testable on
 * its own.
 */

export function filterQuestions(
    questions: DiagnosticQuestionResponse[],
    {
        status,
        topicCode,
        search,
    }: {
        status?: 'draft' | 'published' | null
        topicCode?: string | null
        search?: string
    }
): DiagnosticQuestionResponse[] {
    const needle = (search ?? '').trim().toLowerCase()
    return questions.filter((q) => {
        if (status && q.status !== status) return false
        if (topicCode && q.topicCode !== topicCode) return false
        if (
            needle &&
            !q.stem.toLowerCase().includes(needle) &&
            !q.topicCode.toLowerCase().includes(needle)
        ) {
            return false
        }
        return true
    })
}

/** Swap the item at `index` with its neighbour in `direction` (-1 up / +1
 * down), returning a new array. A no-op at the ends. */
export function moveItem<T>(arr: T[], index: number, direction: -1 | 1): T[] {
    const target = index + direction
    if (target < 0 || target >= arr.length) return arr
    const copy = [...arr]
    ;[copy[index], copy[target]] = [copy[target], copy[index]]
    return copy
}

/** The chosen questions, resolved from ids and kept in selection order —
 * dropping any id that no longer resolves (a question deleted out from under
 * the draft). */
export function orderedSelection(
    all: DiagnosticQuestionResponse[],
    selectedIds: string[]
): DiagnosticQuestionResponse[] {
    const byId = new Map(all.map((q) => [q.id, q]))
    return selectedIds
        .map((id) => byId.get(id))
        .filter((q): q is DiagnosticQuestionResponse => q !== undefined)
}
