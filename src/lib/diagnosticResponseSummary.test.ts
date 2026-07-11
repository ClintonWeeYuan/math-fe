import { describe, expect, it } from 'vitest'
import {
    isAnswered,
    isFlagged,
    summarizeResponses,
} from './diagnosticResponseSummary'
import type {
    DiagnosticResponseState,
    StudentDiagnosticQuestionResponse,
} from '@/client'

function q(id: string): StudentDiagnosticQuestionResponse {
    return { id, stem: id, options: [{ label: 'A', text: 'x' }] }
}
function resp(
    questionId: string,
    over: Partial<DiagnosticResponseState> = {}
): DiagnosticResponseState {
    return {
        questionId,
        questionOrderIndex: 0,
        selectedOption: null,
        isFlagged: false,
        viewCount: 0,
        ...over,
    }
}

describe('diagnosticResponseSummary', () => {
    it('treats a null/undefined selectedOption as unanswered', () => {
        expect(isAnswered(undefined)).toBe(false)
        expect(isAnswered(resp('a'))).toBe(false)
        expect(isAnswered(resp('a', { selectedOption: 'A' }))).toBe(true)
    })

    it('reads isFlagged with a false default', () => {
        expect(isFlagged(undefined)).toBe(false)
        expect(isFlagged(resp('a', { isFlagged: true }))).toBe(true)
    })

    it('summarizes counts over the questions using the shared predicates', () => {
        const questions = [q('a'), q('b'), q('c'), q('d')]
        const responses = [
            resp('a', { selectedOption: 'A' }),
            resp('b', { selectedOption: 'A', isFlagged: true }),
            resp('c', { isFlagged: true }), // flagged but unanswered
        ]
        expect(summarizeResponses(questions, responses)).toEqual({
            total: 4,
            answered: 2, // a, b
            flagged: 2, // b, c
            unanswered: 2, // c, d
        })
    })

    it('counts everything unanswered when there are no responses yet', () => {
        const questions = [q('a'), q('b')]
        expect(summarizeResponses(questions, [])).toEqual({
            total: 2,
            answered: 0,
            flagged: 0,
            unanswered: 2,
        })
    })
})
