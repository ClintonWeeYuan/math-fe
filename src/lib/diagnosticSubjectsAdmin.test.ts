import { describe, expect, it } from 'vitest'
import { subjectsInUse } from './diagnosticSubjectsAdmin'
import type { DiagnosticSetResponse } from '@/client'

function s(id: string, title: string, subject: string | null): DiagnosticSetResponse {
    return {
        id, title, description: null, timeLimitMinutes: 40, questionIds: [],
        isFree: false, status: 'draft', subject, createdAt: '2026-07-13T00:00:00Z',
    }
}

describe('subjectsInUse', () => {
    it('groups sets by their subject, sorted, with ids and titles', () => {
        const groups = subjectsInUse([
            s('1', 'Physics A', 'ESAT Physics'),
            s('2', 'Maths A', 'ESAT Maths I'),
            s('3', 'Physics B', 'ESAT Physics'),
        ])
        expect(groups.map((g) => g.subject)).toEqual(['ESAT Maths I', 'ESAT Physics'])
        const physics = groups.find((g) => g.subject === 'ESAT Physics')!
        expect(physics.setIds).toEqual(['1', '3'])
        expect(physics.setTitles).toEqual(['Physics A', 'Physics B'])
    })

    it('excludes uncategorised (null-subject) sets', () => {
        const groups = subjectsInUse([s('1', 'A', null), s('2', 'B', 'ESAT Physics')])
        expect(groups.map((g) => g.subject)).toEqual(['ESAT Physics'])
    })

    it('surfaces drift as distinct subjects (so it can be fixed)', () => {
        // "Maths 1" and "Maths I" are different labels -> two rows to reconcile.
        const groups = subjectsInUse([s('1', 'A', 'ESAT Maths 1'), s('2', 'B', 'ESAT Maths I')])
        expect(groups.map((g) => g.subject)).toEqual(['ESAT Maths 1', 'ESAT Maths I'])
    })
})
