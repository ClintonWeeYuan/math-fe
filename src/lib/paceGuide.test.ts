import { describe, expect, it } from 'vitest'
import { paceLabel, paceStatus, type PaceInput } from './paceGuide'

const START = Date.parse('2026-10-16T10:00:00Z')

// 27 questions in 40 minutes: 88.9 s a question.
function at(seconds: number, answered: number, over: Partial<PaceInput> = {}) {
    return paceStatus({
        startedAt: new Date(START).toISOString(),
        serverDeadlineAt: new Date(START + 40 * 60_000).toISOString(),
        questionCount: 27,
        answered,
        nowMs: START + seconds * 1000,
        ...over,
    })
}

describe('paceStatus', () => {
    it('gives the question in progress its allowance before calling it behind', () => {
        // 61 s into question 1 is well inside its 89.
        expect(at(61, 0)).toMatchObject({ kind: 'on', allowanceSeconds: 89 })
    })

    it('is behind once the time spent passes the answered questions plus the one in progress', () => {
        // 10 minutes in, 3 answered: pace allows 4 × 89 = 356 s; 244 s over.
        expect(at(600, 3)).toMatchObject({ kind: 'behind', minutes: 4 })
    })

    it('is ahead when answers run more than a minute ahead of the clock', () => {
        // 5 minutes in, 6 answered: 6 × 89 = 533 s of pace for 300 s spent.
        expect(at(300, 6)).toMatchObject({ kind: 'ahead', minutes: 4 })
    })

    it('reads all answered as done', () => {
        expect(at(1800, 27)).toEqual({ kind: 'done' })
    })

    it('includes extra time, because the deadline already does', () => {
        // 50 minutes for 27 is 111 s a question.
        const status = at(61, 0, {
            serverDeadlineAt: new Date(START + 50 * 60_000).toISOString(),
        })
        expect(status).toMatchObject({ kind: 'on', allowanceSeconds: 111 })
    })

    it('takes rest breaks out of both the limit and the time spent', () => {
        // A 10-minute break moved the deadline to 50 minutes. 20 minutes
        // after the start is 10 minutes of exam time, and 6 answered in 10
        // minutes is on pace (7 × 89 = 622 s allowed with one in progress).
        const status = at(1200, 6, {
            serverDeadlineAt: new Date(START + 50 * 60_000).toISOString(),
            breakBudgetSeconds: 600,
            breakSecondsRemaining: 0,
        })
        expect(status).toMatchObject({ kind: 'on', allowanceSeconds: 89 })
    })

    it('has nothing to say without a usable clock', () => {
        expect(at(60, 0, { questionCount: 0 })).toBeNull()
        expect(at(60, 0, { startedAt: 'not a date' })).toBeNull()
    })
})

describe('paceLabel', () => {
    it('reads as one or two words', () => {
        expect(paceLabel({ kind: 'on', allowanceSeconds: 89 })).toBe('On pace')
        expect(paceLabel({ kind: 'behind', minutes: 4, allowanceSeconds: 89 })).toBe('4 min behind')
        expect(paceLabel({ kind: 'ahead', minutes: 2, allowanceSeconds: 89 })).toBe('2 min ahead')
        expect(paceLabel({ kind: 'done' })).toBe('All answered')
    })
})
