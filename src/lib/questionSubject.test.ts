import { describe, expect, it } from 'vitest'
import {
    subjectOfQuestion,
    skillLabel,
    topicPrefix,
    subjectsInUse,
} from './questionSubject'

/**
 * Naming a question's skill requires knowing its subject, because S-codes are
 * subject-scoped. The tests that matter are the ones where the subject is NOT
 * knowable: a bare "S4" is unhelpful, but "S4 · Multi-Step Problem Solving"
 * on a Biology question is misinformation, and an admin retagging questions
 * would act on it.
 */

const set = (id: string, subject: string | null) =>
    ({ id, subject, title: id }) as never

const q = (id: string, topicCode: string) => ({ id, topicCode })

describe('deriving the subject', () => {
    it('takes it from the set the question is in', () => {
        const membership = new Map([['q1', [set('s1', 'ESAT Physics')]]])
        expect(subjectOfQuestion(q('q1', 'P1.2'), membership)).toBe(
            'ESAT Physics'
        )
    })

    it('accepts several sets that agree', () => {
        const membership = new Map([
            ['q1', [set('a', 'ESAT Biology'), set('b', 'ESAT Biology')]],
        ])
        expect(subjectOfQuestion(q('q1', 'B1.1'), membership)).toBe(
            'ESAT Biology'
        )
    })

    it('refuses to choose when sets disagree', () => {
        const membership = new Map([
            ['q1', [set('a', 'ESAT Maths 1'), set('b', 'TMUA Paper 1')]],
        ])
        expect(subjectOfQuestion(q('q1', 'MM1.5'), membership)).toBeNull()
    })

    it('falls back to the topic prefix when it is unambiguous', () => {
        // 479 questions belong to no set. B, C and P each map to exactly one
        // subject across the bank, so those are still nameable.
        const none = new Map()
        expect(subjectOfQuestion(q('q1', 'B11.2e'), none)).toBe('ESAT Biology')
        expect(subjectOfQuestion(q('q2', 'C4.1'), none)).toBe('ESAT Chemistry')
        expect(subjectOfQuestion(q('q3', 'P7.2'), none)).toBe('ESAT Physics')
    })

    it('will not guess for the maths prefixes, which genuinely span subjects', () => {
        // M is mostly ESAT Maths 1 but partly Maths 2; MM spans ESAT Maths 2
        // and both TMUA papers. Picking the likelier one would be wrong for a
        // known fraction of the bank, silently.
        const none = new Map()
        expect(subjectOfQuestion(q('q1', 'M8.4'), none)).toBeNull()
        expect(subjectOfQuestion(q('q2', 'MM1.5'), none)).toBeNull()
    })

    it('is unknown with no set and no recognisable code', () => {
        expect(subjectOfQuestion(q('q1', 'GenLogic'), new Map())).toBeNull()
        expect(subjectOfQuestion(q('q2', ''), new Map())).toBeNull()
    })
})

describe('topicPrefix', () => {
    it('reads the leading letters, not the numbers', () => {
        expect(topicPrefix('B11.2e')).toBe('B')
        expect(topicPrefix('MM1.5/MM7.3')).toBe('MM')
        expect(topicPrefix('GenLogic')).toBe('GenLogic')
    })

    it('is null for a code with no letters', () => {
        expect(topicPrefix('1.2')).toBeNull()
        expect(topicPrefix(null)).toBeNull()
    })
})

describe('labelling a skill', () => {
    it('names it when the subject is known', () => {
        expect(skillLabel('S4', 'ESAT Physics')).toBe(
            'S4 · Multi-Step Problem Solving'
        )
    })

    it('names the SAME code differently in another subject', () => {
        // The whole reason this is careful: S4 is not one skill.
        expect(skillLabel('S4', 'ESAT Biology')).toBe(
            'S4 · Proportional & Rate Reasoning'
        )
    })

    it('shows the bare code when the subject is unknown', () => {
        expect(skillLabel('S4', null)).toBe('S4')
    })

    it('shows the bare code for a subject with no framework', () => {
        expect(skillLabel('S4', 'SPM Chemistry')).toBe('S4')
    })

    it('does not print the code twice when there is no name', () => {
        expect(skillLabel('S9', 'ESAT Physics')).toBe('S9')
    })

    it('is empty for a question with no skill', () => {
        expect(skillLabel(null, 'ESAT Physics')).toBe('')
    })
})

describe('the subjects available to filter by', () => {
    it('lists each once, sorted', () => {
        const membership = new Map([
            ['q1', [set('a', 'ESAT Physics')]],
            ['q2', [set('b', 'ESAT Biology')]],
            ['q3', [set('c', 'ESAT Physics')]],
        ])
        expect(
            subjectsInUse(
                [q('q1', 'P1'), q('q2', 'B1'), q('q3', 'P2')],
                membership
            )
        ).toEqual(['ESAT Biology', 'ESAT Physics'])
    })

    it('leaves out the ones it cannot derive', () => {
        expect(subjectsInUse([q('q1', 'MM1.5')], new Map())).toEqual([])
    })
})
