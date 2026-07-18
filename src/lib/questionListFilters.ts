import type { DiagnosticQuestionResponse, DiagnosticSetResponse } from '@/client'
import { filterQuestions } from '@/lib/questionPicker.ts'

/**
 * Reverse-lookup + filtering for the diagnostic questions list. A question
 * has no set field — the *set* lists its questions (§3) — so "which sets is
 * this question in" is derived here, and a question can be in several sets
 * or none.
 */

/** questionId -> the sets that contain it (in the order sets were given). */
export function setsByQuestionId(
    sets: DiagnosticSetResponse[]
): Map<string, DiagnosticSetResponse[]> {
    const map = new Map<string, DiagnosticSetResponse[]>()
    for (const set of sets) {
        for (const qid of set.questionIds) {
            const list = map.get(qid)
            if (list) list.push(set)
            else map.set(qid, [set])
        }
    }
    return map
}

/** Sentinel for the "in no set" (orphan) filter — distinct from "all sets"
 * (null/undefined). */
export const NO_SET = '__none__'

export function filterQuestionsForList(
    questions: DiagnosticQuestionResponse[],
    membership: Map<string, DiagnosticSetResponse[]>,
    {
        setId,
        status,
        topicCode,
        search,
    }: {
        setId?: string | null
        status?: 'draft' | 'published' | null
        topicCode?: string | null
        search?: string
    }
): DiagnosticQuestionResponse[] {
    let result = questions
    if (setId === NO_SET) {
        result = result.filter((q) => (membership.get(q.id)?.length ?? 0) === 0)
    } else if (setId) {
        result = result.filter((q) =>
            (membership.get(q.id) ?? []).some((s) => s.id === setId)
        )
    }
    // Reuse the picker's status/topic/search predicate, so the two places
    // that filter questions stay consistent.
    return filterQuestions(result, { status, topicCode, search })
}
