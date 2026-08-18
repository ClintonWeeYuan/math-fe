import type {
    DiagnosticQuestionResponse,
    DiagnosticSetResponse,
} from '@/client'
import { skillName } from '@/lib/diagnosticSkillFrameworks.ts'

/**
 * Which subject a diagnostic question belongs to, and therefore what its
 * skill code means.
 *
 * This matters because S-codes are subject-scoped: S4 is "Multi-Step Problem
 * Solving" in Physics and "Proportional & Rate Reasoning" in Biology. Naming
 * one with the wrong framework is worse than leaving it as "S4" — a bare code
 * is merely unhelpful, a wrong name is misinformation an admin would act on.
 *
 * So the subject is derived, never guessed:
 *
 *   1. From the sets the question belongs to, when they agree. This is the
 *      real answer — a set states its subject. Across the live bank, 751 of
 *      1230 questions resolve this way and none conflict.
 *
 *   2. Failing that, from the topic code's prefix, but only where that prefix
 *      maps to exactly one subject. B, C and P do. M and MM do NOT — M is
 *      mostly ESAT Maths 1 but partly Maths 2, and MM spans ESAT Maths 2 and
 *      both TMUA papers — so those stay unknown rather than being assigned
 *      the likelier option.
 *
 *   3. Otherwise unknown, and the caller shows the bare code.
 */

/**
 * Topic-code prefixes whose subject is unambiguous, checked against the whole
 * bank. Deliberately partial: `M` and `MM` are absent because they genuinely
 * span subjects, and a lookup that answered for them would be inventing
 * certainty the codes do not carry.
 */
const UNAMBIGUOUS_PREFIX: Record<string, string> = {
    B: 'ESAT Biology',
    C: 'ESAT Chemistry',
    P: 'ESAT Physics',
}

/** The leading letters of a topic code: "B11.2e" -> "B", "MM1.5" -> "MM". */
export function topicPrefix(
    topicCode: string | null | undefined
): string | null {
    const match = /^([A-Za-z]+)/.exec((topicCode ?? '').trim())
    return match ? match[1] : null
}

export function subjectOfQuestion(
    question: Pick<DiagnosticQuestionResponse, 'id' | 'topicCode'>,
    membership: Map<string, DiagnosticSetResponse[]>
): string | null {
    const subjects = new Set(
        (membership.get(question.id) ?? [])
            .map((s) => s.subject)
            .filter((s): s is string => Boolean(s))
    )
    // One set's subject is the answer. Several disagreeing is not a case the
    // data currently produces, and if it ever does, "unknown" is the honest
    // reading rather than picking the first.
    if (subjects.size === 1) return [...subjects][0]
    if (subjects.size > 1) return null

    const prefix = topicPrefix(question.topicCode)
    return prefix ? (UNAMBIGUOUS_PREFIX[prefix] ?? null) : null
}

/**
 * A skill code with its name where the name is knowable: "S4 · Multi-Step
 * Problem Solving", or just "S4".
 */
export function skillLabel(
    code: string | null | undefined,
    subject: string | null
): string {
    if (!code) return ''
    if (subject === null) return code
    const name = skillName(subject, code)
    // skillName falls back to the code itself for a subject with no
    // framework, or a code outside it — no point printing "S4 · S4".
    return name === code ? code : `${code} · ${name}`
}

/** Subjects present in the bank, for a filter. Sorted, with a bucket for the
 *  questions whose subject cannot be derived — 479 of them today, and being
 *  able to see exactly those is half the reason for the filter. */
export const NO_SUBJECT = '__none__'

export function subjectsInUse(
    questions: Pick<DiagnosticQuestionResponse, 'id' | 'topicCode'>[],
    membership: Map<string, DiagnosticSetResponse[]>
): string[] {
    const found = new Set<string>()
    for (const q of questions) {
        const subject = subjectOfQuestion(q, membership)
        if (subject !== null) found.add(subject)
    }
    return [...found].sort()
}
