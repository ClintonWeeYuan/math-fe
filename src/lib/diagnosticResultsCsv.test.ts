import { describe, expect, it } from 'vitest'
import { resultsToCsv } from './diagnosticResultsCsv'
import type { AdminAttemptResultRow } from '@/client'

function row(over: Partial<AdminAttemptResultRow> = {}): AdminAttemptResultRow {
    return {
        attemptId: 'a1',
        studentId: 's1',
        studentEmail: 'one@x.com',
        setId: 'set1',
        setTitle: 'Set A',
        subject: 'ESAT Physics',
        status: 'submitted',
        totalScore: 12,
        answeredCount: 20,
        questionCount: 27,
        totalTimeSeconds: 1869,
        startedAt: '2026-07-19T10:00:00Z',
        submittedAt: '2026-07-19T10:30:00Z',
        ...over,
    }
}

describe('resultsToCsv', () => {
    it('emits a header row plus one line per attempt', () => {
        const csv = resultsToCsv([row(), row({ attemptId: 'a2' })])
        const lines = csv.split('\n')
        expect(lines).toHaveLength(3) // header + 2
        expect(lines[0]).toContain('Student email')
        expect(lines[1]).toContain('one@x.com')
        expect(lines[1]).toContain('12')
        expect(lines[1]).toContain('20')
        expect(lines[1]).toContain('27')
    })

    it('renders null score / subject / submitted as empty fields, not "null"', () => {
        const csv = resultsToCsv([
            row({ totalScore: null, subject: null, submittedAt: null, status: 'in_progress' }),
        ])
        const cols = csv.split('\n')[1].split(',')
        // Score (idx 4), Subject (idx 2), Submitted (last) are blank.
        expect(cols[4]).toBe('')
        expect(cols[2]).toBe('')
        expect(cols[cols.length - 1]).toBe('')
        expect(csv).not.toContain('null')
    })

    it('escapes commas and quotes in text fields (RFC-4180)', () => {
        const csv = resultsToCsv([
            row({ setTitle: 'Set A, B', subject: 'He said "hi"' }),
        ])
        const line = csv.split('\n')[1]
        expect(line).toContain('"Set A, B"')
        expect(line).toContain('"He said ""hi"""')
    })
})
