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
        const [header, line] = csv.split('\n')
        // Looked up by name rather than by a hardcoded index. The indices this
        // test used to assert (Score at 4, Subject at 2) silently became State
        // and School when the profile columns were inserted — both blank in
        // this fixture, so it kept passing while checking the wrong cells.
        const at = (name: string) =>
            line.split(',')[header.split(',').indexOf(name)]
        expect(at('Score')).toBe('')
        expect(at('Subject')).toBe('')
        expect(at('Submitted')).toBe('')
        expect(csv).not.toContain('null')
    })

    it('carries the student profile, and labels the sitting for a reader', () => {
        const csv = resultsToCsv([
            row({
                studentName: 'Aisyah',
                school: 'SMK Sungai Maong',
                level: 'Form 5',
                state: 'Sarawak',
                testSitting: 'october_2026',
                targetUniversities: ['Cambridge', 'Imperial'],
            } as Partial<AdminAttemptResultRow>),
        ])
        const [header, line] = csv.split('\n')
        const at = (name: string) =>
            line.split(',')[header.split(',').indexOf(name)]
        expect(at('Name')).toBe('Aisyah')
        expect(at('School')).toBe('SMK Sungai Maong')
        expect(at('Level')).toBe('Form 5')
        expect(at('State')).toBe('Sarawak')
        // The label, not the stored 'october_2026'.
        expect(at('Sitting')).toBe('October 2026')
        // Semicolons, so a spreadsheet splitting on commas cannot halve the
        // cell — and therefore no quoting is needed either.
        expect(at('Target universities')).toBe('Cambridge; Imperial')
    })

    it('leaves the profile blank for an account that has answered nothing', () => {
        const [header, line] = resultsToCsv([row()]).split('\n')
        const at = (name: string) =>
            line.split(',')[header.split(',').indexOf(name)]
        expect(at('Name')).toBe('')
        expect(at('School')).toBe('')
        expect(at('Target universities')).toBe('')
        // A missing sitting is a dash in the table; in a CSV it is a dash too,
        // because sittingLabel is the one place that decision is made.
        expect(at('Sitting')).toBe('—')
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
