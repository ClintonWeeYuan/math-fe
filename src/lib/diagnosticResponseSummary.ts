import type {
    DiagnosticResponseState,
    StudentDiagnosticQuestionResponse,
} from '@/client'

/**
 * The single definition of "answered" / "flagged" for a per-question
 * response. The exam navigator's cell colouring and the review screen's
 * counts both go through these, so a question the navigator shows green
 * is a question the review screen counts as answered — they can't
 * disagree because they read the same predicates over the same shared
 * response-state (the ['diagnostic-attempt', attemptId] query cache).
 */
export function isAnswered(response: DiagnosticResponseState | undefined): boolean {
    return response?.selectedOption !== undefined && response?.selectedOption !== null
}

export function isFlagged(response: DiagnosticResponseState | undefined): boolean {
    return response?.isFlagged ?? false
}

export type ResponseSummary = {
    total: number
    answered: number
    flagged: number
    unanswered: number
}

export function summarizeResponses(
    questions: StudentDiagnosticQuestionResponse[],
    responses: DiagnosticResponseState[]
): ResponseSummary {
    const byQuestionId = new Map(responses.map((r) => [r.questionId, r]))
    let answered = 0
    let flagged = 0
    for (const question of questions) {
        const response = byQuestionId.get(question.id)
        if (isAnswered(response)) answered += 1
        if (isFlagged(response)) flagged += 1
    }
    return {
        total: questions.length,
        answered,
        flagged,
        unanswered: questions.length - answered,
    }
}
