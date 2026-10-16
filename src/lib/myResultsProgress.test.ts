import { describe, expect, it } from 'vitest'
import { progressBySubject, type StudentAttempt } from './myResults'

let n = 0
function attempt(over: Partial<StudentAttempt>): StudentAttempt {
    n += 1
    return {
        attemptId: `att-${n}`,
        setId: 'set-a',
        setTitle: 'ESAT Physics — Diagnostic Set A',
        subject: 'ESAT Physics',
        format: 'full',
        status: 'submitted',
        totalScore: 14,
        answeredCount: 27,
        questionCount: 27,
        startedAt: '2026-10-01T10:00:00Z',
        submittedAt: '2026-10-01T10:40:00Z',
        ...over,
    }
}

describe('progressBySubject', () => {
    it('orders a module’s papers by when they were sat, as percentages, with the change', () => {
        const [physics] = progressBySubject([
            attempt({ setId: 'b', setTitle: 'ESAT Physics — Diagnostic Set B', totalScore: 18, startedAt: '2026-10-05T10:00:00Z', submittedAt: '2026-10-05T10:40:00Z' }),
            attempt({ setId: 'a', totalScore: 13 }),
        ])
        expect(physics.points.map((p) => p.pct)).toEqual([48, 67])
        expect(physics.change).toBe(19)
    })

    it('leaves out minis, papers mostly unanswered, and anything unfinished', () => {
        const out = progressBySubject([
            attempt({ setId: 'a' }),
            attempt({ setId: 'm', format: 'mini', questionCount: 10, answeredCount: 10 }),
            attempt({ setId: 'b', answeredCount: 15 }),
            attempt({ setId: 'c', status: 'in_progress', submittedAt: null }),
        ])
        expect(out[0].points).toHaveLength(1)
        expect(out[0].change).toBeNull()
    })

    it('counts only the first sitting of a set: a second go measures memory too', () => {
        const [physics] = progressBySubject([
            attempt({ setId: 'a', totalScore: 10 }),
            attempt({ setId: 'a', totalScore: 25, startedAt: '2026-10-09T10:00:00Z', submittedAt: '2026-10-09T10:40:00Z' }),
        ])
        expect(physics.points.map((p) => p.pct)).toEqual([37])
    })

    it('keeps modules apart, the most-sat first', () => {
        const out = progressBySubject([
            attempt({ setId: 'm1', subject: 'ESAT Math 1', setTitle: 'ESAT Math 1 — Diagnostic Set A' }),
            attempt({ setId: 'a' }),
            attempt({ setId: 'b', startedAt: '2026-10-03T10:00:00Z', submittedAt: '2026-10-03T10:40:00Z' }),
        ])
        expect(out.map((p) => [p.subject, p.points.length])).toEqual([
            ['ESAT Physics', 2],
            ['ESAT Math 1', 1],
        ])
    })

    it('is empty with nothing sat', () => {
        expect(progressBySubject(undefined)).toEqual([])
        expect(progressBySubject([])).toEqual([])
    })
})
