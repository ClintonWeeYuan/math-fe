import { describe, expect, it } from 'vitest'
import { nextStepsFor, testFromSubject } from './diagnosticNextSteps'
import type { PublishedDiagnosticSet } from '@/client'

/**
 * The rules that decide what a student is offered after finishing a paper.
 *
 * The one that matters most is the paid-set exclusion: while billing is off,
 * starting a paid set 402s, so recommending one would take a student who just
 * finished forty minutes of work and hand them a wall.
 */

let n = 0
const set = (over: Partial<PublishedDiagnosticSet> = {}) =>
    ({
        id: `set-${++n}`,
        title: 'A paper',
        subject: 'ESAT Math 1',
        description: null,
        timeLimitMinutes: 40,
        questionCount: 27,
        isFree: true,
        ...over,
    }) as PublishedDiagnosticSet

const mini = (over: Partial<PublishedDiagnosticSet> = {}) =>
    ({
        ...set({ timeLimitMinutes: 15, questionCount: 10, ...over }),
        format: 'mini',
    }) as PublishedDiagnosticSet

const call = (over: Parameters<typeof nextStepsFor>[0]) => nextStepsFor(over)

describe('testFromSubject', () => {
    it('reads the test off the stored subject prefix', () => {
        expect(testFromSubject('ESAT Math 1')).toBe('esat')
        expect(testFromSubject('TMUA Paper 2')).toBe('tmua')
    })

    it('is undefined for anything else, so nothing is recommended', () => {
        expect(testFromSubject('SPM Add Maths')).toBeUndefined()
        expect(testFromSubject(null)).toBeUndefined()
        expect(testFromSubject(undefined)).toBeUndefined()
    })
})

describe('what to offer after a diagnostic', () => {
    it('never offers a paid set while billing is off', () => {
        const steps = call({
            subject: 'ESAT Math 1',
            currentSetId: 'current',
            isMini: false,
            billingLive: false,
            sets: [
                set({ subject: 'ESAT Physics', isFree: false }),
                set({ subject: 'ESAT Chemistry', isFree: true }),
            ],
        })

        expect(steps.otherSubjects.map((s) => s.subject)).toEqual([
            'ESAT Chemistry',
        ])
    })

    it('offers paid sets once billing is live', () => {
        const steps = call({
            subject: 'ESAT Math 1',
            currentSetId: 'current',
            isMini: false,
            billingLive: true,
            sets: [set({ subject: 'ESAT Physics', isFree: false })],
        })

        expect(steps.otherSubjects.map((s) => s.subject)).toEqual([
            'ESAT Physics',
        ])
    })

    it('picks the shortest set per subject — the easiest second yes', () => {
        const steps = call({
            subject: 'ESAT Math 1',
            currentSetId: 'current',
            isMini: false,
            billingLive: false,
            sets: [
                set({ subject: 'ESAT Physics', title: 'Set A' }),
                mini({ subject: 'ESAT Physics', title: 'Mini' }),
            ],
        })

        expect(steps.otherSubjects).toHaveLength(1)
        expect(steps.otherSubjects[0].title).toBe('Mini')
    })

    it('never recommends the subject just sat among the other modules', () => {
        const steps = call({
            subject: 'ESAT Math 1',
            currentSetId: 'current',
            isMini: false,
            billingLive: false,
            sets: [
                set({ subject: 'ESAT Math 1', title: 'Set B' }),
                set({ subject: 'ESAT Biology' }),
            ],
        })

        expect(steps.otherSubjects.map((s) => s.subject)).toEqual([
            'ESAT Biology',
        ])
    })

    it('leads a mini with the full paper of the same subject', () => {
        const steps = call({
            subject: 'ESAT Math 1',
            currentSetId: 'current',
            isMini: true,
            billingLive: false,
            sets: [
                set({ subject: 'ESAT Math 1', title: 'Set A' }),
                set({ subject: 'ESAT Biology' }),
            ],
        })

        expect(steps.sameSubject?.title).toBe('Set A')
    })

    it('does not offer another mini as the step up from a mini', () => {
        const steps = call({
            subject: 'ESAT Math 1',
            currentSetId: 'current',
            isMini: true,
            billingLive: false,
            sets: [mini({ subject: 'ESAT Math 1', title: 'Another mini' })],
        })

        expect(steps.sameSubject).toBeUndefined()
    })

    it('offers no step up after a full paper — there is nothing longer', () => {
        const steps = call({
            subject: 'ESAT Math 1',
            currentSetId: 'current',
            isMini: false,
            billingLive: false,
            sets: [set({ subject: 'ESAT Math 1', title: 'Set B' })],
        })

        expect(steps.sameSubject).toBeUndefined()
    })

    it('never recommends the set just sat', () => {
        const steps = call({
            subject: 'ESAT Math 1',
            currentSetId: 'the-one-just-sat',
            isMini: true,
            billingLive: false,
            sets: [
                set({ id: 'the-one-just-sat', subject: 'ESAT Math 1' }),
                set({ id: 'the-one-just-sat', subject: 'ESAT Physics' }),
            ],
        })

        expect(steps.sameSubject).toBeUndefined()
        expect(steps.otherSubjects).toEqual([])
    })

    it('copes with the catalogue not having loaded', () => {
        const steps = call({
            subject: 'ESAT Math 1',
            currentSetId: 'current',
            isMini: false,
            billingLive: false,
            sets: undefined,
        })

        expect(steps).toEqual({ sameSubject: undefined, otherSubjects: [] })
    })
})
