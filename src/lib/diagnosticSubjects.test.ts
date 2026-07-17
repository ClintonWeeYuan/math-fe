import { describe, expect, it } from 'vitest'
import {
    DIAGNOSTIC_SUBJECTS,
    UNCATEGORISED_LABEL,
    groupSetsBySubject,
} from './diagnosticSubjects'

function s(title: string, subject?: string | null) {
    return { title, subject: subject ?? null }
}

describe('groupSetsBySubject', () => {
    it('lists the known subjects in a stable order, even when empty', () => {
        const groups = groupSetsBySubject([])
        // Every known subject still gets a heading — an empty "ESAT Physics"
        // says "nothing imported yet", rather than the paper vanishing.
        expect(groups.map((g) => g.subject)).toEqual([...DIAGNOSTIC_SUBJECTS])
        expect(groups.every((g) => g.sets.length === 0)).toBe(true)
    })

    it('files each set under its subject', () => {
        const groups = groupSetsBySubject([
            s('M2 A', 'ESAT Maths II'),
            s('M2 B', 'ESAT Maths II'),
            s('Phys A', 'ESAT Physics'),
        ])
        const byName = Object.fromEntries(groups.map((g) => [g.subject, g.sets]))
        expect(byName['ESAT Maths II'].map((x) => x.title)).toEqual(['M2 A', 'M2 B'])
        expect(byName['ESAT Physics'].map((x) => x.title)).toEqual(['Phys A'])
        expect(byName['ESAT Maths I']).toEqual([])
    })

    it('puts uncategorised last, and only when something is uncategorised', () => {
        expect(groupSetsBySubject([s('A', 'ESAT Maths I')]).map((g) => g.subject)).not.toContain(
            UNCATEGORISED_LABEL
        )
        const groups = groupSetsBySubject([s('A', 'ESAT Maths I'), s('B', null)])
        expect(groups[groups.length - 1].subject).toBe(UNCATEGORISED_LABEL)
        expect(groups[groups.length - 1].sets.map((x) => x.title)).toEqual(['B'])
    })

    it('shows a typed-in subject that is not a known one, after the known ones', () => {
        const groups = groupSetsBySubject([
            s('Chem A', 'ESAT Chemistry'),
            s('M1 A', 'ESAT Maths I'),
            s('Bio A', 'ESAT Biology'),
        ])
        const names = groups.map((g) => g.subject)
        // Known first (in their fixed order), then custom alphabetically.
        expect(names.slice(0, 3)).toEqual([...DIAGNOSTIC_SUBJECTS])
        expect(names.slice(3)).toEqual(['ESAT Biology', 'ESAT Chemistry'])
    })

    it('does not duplicate a set across groups', () => {
        const groups = groupSetsBySubject([s('A', 'ESAT Physics'), s('B', null)])
        expect(groups.reduce((n, g) => n + g.sets.length, 0)).toBe(2)
    })
})
