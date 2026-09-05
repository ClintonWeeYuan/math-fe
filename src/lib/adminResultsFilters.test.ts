import { describe, expect, it } from 'vitest'
import type { AdminAttemptResultRow } from '@/client'
import {
    ANY,
    NO_FILTERS,
    applyResultsFilters,
    countsOf,
    reconcileFilters,
    setFacets,
    studentsInBothTests,
    subjectFacets,
    testFacets,
    testKeyOf,
} from './adminResultsFilters'

function row(over: Partial<AdminAttemptResultRow> = {}): AdminAttemptResultRow {
    return {
        attemptId: 'a1',
        studentId: 's1',
        studentEmail: 'one@x.com',
        setId: 'set1',
        setTitle: 'ESAT Physics — Diagnostic Set A',
        subject: 'ESAT Physics',
        status: 'submitted',
        totalScore: 12,
        answeredCount: 20,
        questionCount: 27,
        totalTimeSeconds: 125,
        startedAt: '2026-07-19T10:00:00Z',
        submittedAt: '2026-07-19T10:30:00Z',
        ...over,
    }
}

const esat = row()
const esatChem = row({
    attemptId: 'a2',
    setId: 'set2',
    setTitle: 'ESAT Chemistry — Diagnostic Set B',
    subject: 'ESAT Chemistry',
})
const tmua = row({
    attemptId: 'a3',
    studentId: 's2',
    studentEmail: 'two@x.com',
    setId: 'set3',
    setTitle: 'TMUA Paper 1 - Diagnostic Set A',
    subject: 'TMUA Paper 1',
})
const all = [esat, esatChem, tmua]

describe('testKeyOf', () => {
    it('reads the test off the subject prefix', () => {
        expect(testKeyOf(esat)).toBe('esat')
        expect(testKeyOf(tmua)).toBe('tmua')
    })

    it('buckets an unrecognised subject as other rather than dropping it', () => {
        expect(testKeyOf(row({ subject: 'SPM Add Maths' }))).toBe('other')
        expect(testKeyOf(row({ subject: null }))).toBe('other')
    })
})

describe('applyResultsFilters', () => {
    it('returns everything when nothing is narrowed', () => {
        expect(applyResultsFilters(all, NO_FILTERS)).toHaveLength(3)
    })

    it('narrows by test', () => {
        expect(applyResultsFilters(all, { ...NO_FILTERS, test: 'tmua' })).toEqual([
            tmua,
        ])
    })

    it('narrows by subject', () => {
        expect(
            applyResultsFilters(all, { ...NO_FILTERS, subject: 'ESAT Chemistry' })
        ).toEqual([esatChem])
    })

    it('narrows by set', () => {
        expect(applyResultsFilters(all, { ...NO_FILTERS, setId: 'set3' })).toEqual([
            tmua,
        ])
    })

    it('combines dimensions', () => {
        expect(
            applyResultsFilters(all, {
                test: 'esat',
                subject: 'ESAT Physics',
                setId: 'set1',
            })
        ).toEqual([esat])
    })

    it('returns nothing when the combination is contradictory', () => {
        expect(
            applyResultsFilters(all, {
                ...NO_FILTERS,
                test: 'tmua',
                subject: 'ESAT Physics',
            })
        ).toEqual([])
    })
})

describe('countsOf', () => {
    it('separates attempts from distinct students', () => {
        // s1 sat two papers, s2 sat one.
        expect(countsOf(all)).toEqual({ attempts: 3, students: 2 })
    })
})

describe('testFacets', () => {
    it('counts attempts and students per test', () => {
        expect(testFacets(all)).toEqual([
            { value: 'esat', label: 'ESAT', attempts: 2, students: 1 },
            { value: 'tmua', label: 'TMUA', attempts: 1, students: 1 },
        ])
    })

    it('omits a test nobody has attempted', () => {
        expect(testFacets([esat]).map((f) => f.value)).toEqual(['esat'])
    })

    it('surfaces an unrecognised subject as its own bucket', () => {
        const spm = row({ attemptId: 'a4', subject: 'SPM Add Maths' })
        expect(testFacets([esat, spm]).map((f) => f.value)).toEqual(['esat', 'other'])
    })

    it('keeps a fixed order regardless of row order', () => {
        expect(testFacets([tmua, esat]).map((f) => f.value)).toEqual(['esat', 'tmua'])
    })
})

describe('studentsInBothTests', () => {
    it('is zero when nobody crosses tests', () => {
        expect(studentsInBothTests(all)).toBe(0)
    })

    it('counts a student who sat both, who would otherwise be double-counted', () => {
        const crossover = row({ attemptId: 'a5', subject: 'TMUA Paper 2' })
        // s1 now appears under ESAT and under TMUA, so the two tab counts
        // sum to more than the distinct student total.
        const rows = [...all, crossover]
        expect(studentsInBothTests(rows)).toBe(1)
        const byTest = testFacets(rows)
        const summed = byTest.reduce((n, f) => n + f.students, 0)
        expect(summed).toBeGreaterThan(countsOf(rows).students)
    })
})

describe('subjectFacets', () => {
    it('lists subjects alphabetically with counts', () => {
        expect(subjectFacets(all, ANY)).toEqual([
            {
                value: 'ESAT Chemistry',
                label: 'ESAT Chemistry',
                attempts: 1,
                students: 1,
            },
            {
                value: 'ESAT Physics',
                label: 'ESAT Physics',
                attempts: 1,
                students: 1,
            },
            { value: 'TMUA Paper 1', label: 'TMUA Paper 1', attempts: 1, students: 1 },
        ])
    })

    it('offers only the chosen test’s subjects', () => {
        expect(subjectFacets(all, 'tmua').map((f) => f.value)).toEqual([
            'TMUA Paper 1',
        ])
    })

    it('skips rows with no subject rather than offering a blank option', () => {
        expect(subjectFacets([row({ subject: null })], ANY)).toEqual([])
    })
})

describe('setFacets', () => {
    it('labels by title but keys by id', () => {
        expect(setFacets(all, 'tmua', ANY)).toEqual([
            {
                value: 'set3',
                label: 'TMUA Paper 1 - Diagnostic Set A',
                attempts: 1,
                students: 1,
            },
        ])
    })

    it('respects the subject filter as well as the test', () => {
        expect(setFacets(all, ANY, 'ESAT Chemistry').map((f) => f.value)).toEqual([
            'set2',
        ])
    })

    it('falls back to the id when a set has no title', () => {
        expect(setFacets([row({ setTitle: null })], ANY, ANY)[0].label).toBe('set1')
    })
})

describe('reconcileFilters', () => {
    it('drops a subject the new test does not contain', () => {
        expect(
            reconcileFilters(all, {
                test: 'tmua',
                subject: 'ESAT Physics',
                setId: ANY,
            })
        ).toEqual({ test: 'tmua', subject: ANY, setId: ANY })
    })

    it('drops a set the new subject does not contain', () => {
        expect(
            reconcileFilters(all, {
                test: ANY,
                subject: 'ESAT Chemistry',
                setId: 'set1',
            })
        ).toEqual({ test: ANY, subject: 'ESAT Chemistry', setId: ANY })
    })

    it('leaves a still-valid selection alone', () => {
        const kept = { test: 'esat', subject: 'ESAT Physics', setId: 'set1' } as const
        expect(reconcileFilters(all, kept)).toEqual(kept)
    })

    it('drops a set when the test change invalidates the subject above it', () => {
        expect(
            reconcileFilters(all, {
                test: 'tmua',
                subject: 'ESAT Physics',
                setId: 'set1',
            })
        ).toEqual({ test: 'tmua', subject: ANY, setId: ANY })
    })
})
