import { describe, expect, it } from 'vitest'
import {
    actionFor,
    bestAttemptForSet,
    completedSubjects,
    coverageFor,
    groupCoverageBySubject,
    isPracticeRetake,
    type StudentAttempt,
} from './myResults'
import type { PublishedDiagnosticSet } from '@/client'

let n = 0
const attempt = (over: Partial<StudentAttempt> = {}): StudentAttempt => ({
    attemptId: `att-${++n}`,
    setId: 'set-a',
    setTitle: 'ESAT Maths 1 — Set A',
    subject: 'ESAT Math 1',
    format: 'full',
    status: 'submitted',
    totalScore: 14,
    answeredCount: 27,
    questionCount: 27,
    startedAt: '2026-08-01T10:00:00Z',
    submittedAt: '2026-08-01T10:40:00Z',
    ...over,
})

const set = (over: Partial<PublishedDiagnosticSet> = {}) =>
    ({
        id: 'set-a',
        title: 'ESAT Maths 1 — Set A',
        subject: 'ESAT Math 1',
        description: null,
        timeLimitMinutes: 40,
        questionCount: 27,
        isFree: true,
        ...over,
    }) as PublishedDiagnosticSet

describe('which attempt speaks for a set', () => {
    it('is the best score, so three goes count as one completion', () => {
        const best = bestAttemptForSet([
            attempt({ totalScore: 9 }),
            attempt({ totalScore: 18 }),
            attempt({ totalScore: 12 }),
        ])
        expect(best?.totalScore).toBe(18)
    })

    it('breaks a tie towards the earlier attempt', () => {
        // Same score is the same evidence, and the first sitting is the one
        // that was not informed by having already seen the questions.
        const best = bestAttemptForSet([
            attempt({ totalScore: 14, startedAt: '2026-08-05T10:00:00Z' }),
            attempt({ totalScore: 14, startedAt: '2026-08-01T10:00:00Z' }),
        ])
        expect(best?.startedAt).toBe('2026-08-01T10:00:00Z')
    })

    it('ignores an attempt still in progress', () => {
        expect(bestAttemptForSet([attempt({ status: 'in_progress' })])).toBeUndefined()
    })

    it('counts a timed-out attempt — running out of time is still a sitting', () => {
        const best = bestAttemptForSet([
            attempt({ status: 'timed_out', totalScore: 11 }),
        ])
        expect(best?.totalScore).toBe(11)
    })
})

describe('the coverage view', () => {
    it('lists modules never opened, which is the whole point of it', () => {
        const rows = coverageFor({
            sets: [set({ id: 'set-a' }), set({ id: 'set-b', subject: 'ESAT Physics' })],
            attempts: [attempt({ setId: 'set-a' })],
        })

        expect(rows.map((r) => r.state)).toEqual(['completed', 'not_attempted'])
    })

    it('shows a set as in progress only when nothing terminal exists for it', () => {
        const rows = coverageFor({
            sets: [set()],
            attempts: [
                attempt({ status: 'submitted', totalScore: 14 }),
                attempt({ status: 'in_progress' }),
            ],
        })

        // A finished sitting outranks a later half-open one: they have done it.
        expect(rows[0].state).toBe('completed')
    })

    it('is empty rather than broken before anything has loaded', () => {
        expect(coverageFor({ sets: undefined, attempts: undefined })).toEqual([])
    })
})

describe('which subjects count as done', () => {
    it('counts a finished paper', () => {
        expect([...completedSubjects([attempt()])]).toEqual(['ESAT Math 1'])
    })

    it('does not count an abandoned one', () => {
        // Treating an abandoned paper as covered would hide the module they
        // most need to go back to.
        expect(
            [...completedSubjects([attempt({ status: 'in_progress' })])]
        ).toEqual([])
    })
})

describe('what to offer on a history row', () => {
    it('offers to resume an attempt still open', () => {
        expect(actionFor(attempt({ status: 'in_progress' }))).toBe('resume')
    })

    it('offers the report for a paper they actually sat', () => {
        expect(actionFor(attempt({ answeredCount: 27, questionCount: 27 }))).toBe(
            'report'
        )
    })

    it('offers a retake when they barely started before time ran out', () => {
        // The report exists, but resting on six of twenty-seven it cannot tell
        // them much — another go is the more useful offer.
        expect(
            actionFor(
                attempt({ status: 'timed_out', answeredCount: 6, questionCount: 27 })
            )
        ).toBe('retake')
    })

    it('treats exactly half as enough to be worth reading', () => {
        expect(
            actionFor(attempt({ answeredCount: 14, questionCount: 27 }))
        ).toBe('report')
    })
})

describe('the bar for having covered a subject', () => {
    it('does not count a paper that ran out of time near the start', () => {
        // Otherwise the recommendations block stops offering the module they
        // most need to go back to — and the coverage card would say Completed
        // while the history row below it offered a retake.
        expect([
            ...completedSubjects([
                attempt({ status: 'timed_out', answeredCount: 4, questionCount: 27 }),
            ]),
        ]).toEqual([])
    })

    it('uses the same bar the retake offer uses, so the two cannot disagree', () => {
        const barelySat = attempt({
            status: 'timed_out',
            answeredCount: 4,
            questionCount: 27,
        })
        expect(actionFor(barelySat)).toBe('retake')
        expect(completedSubjects([barelySat]).size).toBe(0)

        const properlySat = attempt({ answeredCount: 20, questionCount: 27 })
        expect(actionFor(properlySat)).toBe('report')
        expect(completedSubjects([properlySat]).size).toBe(1)
    })
})

describe('retake integrity', () => {
    const first = attempt({
        attemptId: 'first',
        totalScore: 10,
        startedAt: '2026-08-01T10:00:00Z',
        reviewedAt: '2026-08-01T11:00:00Z',
    })
    const afterReview = attempt({
        attemptId: 'second',
        totalScore: 25,
        startedAt: '2026-08-02T10:00:00Z',
    })

    it('marks an attempt started after the answers were seen', () => {
        expect(isPracticeRetake(afterReview, [first, afterReview])).toBe(true)
    })

    it('does not taint an attempt by its own review', () => {
        // Reading your own paper afterwards is the intended behaviour.
        expect(isPracticeRetake(first, [first, afterReview])).toBe(false)
    })

    it('lets the untainted attempt speak for the set, even scoring lower', () => {
        // 10 unaided beats 25 with the answers already read — the coverage
        // view claims to show what they can do, not what they remembered.
        expect(bestAttemptForSet([first, afterReview])?.attemptId).toBe('first')
    })

    it('falls back to a practice retake when every sitting is one', () => {
        // Showing nothing would be worse than showing a qualified number.
        const onlyPractice = attempt({
            attemptId: 'only',
            startedAt: '2026-08-05T10:00:00Z',
        })
        const reviewedElsewhere = attempt({
            attemptId: 'other',
            status: 'in_progress',
            reviewedAt: '2026-08-04T10:00:00Z',
        })
        expect(
            bestAttemptForSet([onlyPractice, reviewedElsewhere])?.attemptId
        ).toBe('only')
    })

    it('is unaffected when nobody has opened a review', () => {
        const a = attempt({ attemptId: 'a', totalScore: 12 })
        const b = attempt({ attemptId: 'b', totalScore: 20 })
        expect(bestAttemptForSet([a, b])?.attemptId).toBe('b')
    })
})

describe('coverage state matches the completion bar', () => {
    it('does not call a barely-answered paper completed', () => {
        // This was live: "Completed · 10/27 answered · scored 2". A green
        // badge on a paper someone barely started tells them not to go back.
        const rows = coverageFor({
            sets: [set()],
            attempts: [
                attempt({ status: 'submitted', answeredCount: 10, questionCount: 27 }),
            ],
        })
        expect(rows[0].state).toBe('partial')
    })

    it('agrees with actionFor and completedSubjects', () => {
        const barely = attempt({
            status: 'submitted',
            answeredCount: 10,
            questionCount: 27,
        })
        expect(coverageFor({ sets: [set()], attempts: [barely] })[0].state).toBe('partial')
        expect(actionFor(barely)).toBe('retake')
        expect(completedSubjects([barely]).size).toBe(0)
    })

    it('still calls a properly sat paper done', () => {
        const properly = attempt({ answeredCount: 27, questionCount: 27 })
        expect(coverageFor({ sets: [set()], attempts: [properly] })[0].state).toBe('completed')
    })
})

describe('grouping coverage by module', () => {
    const rows = () =>
        coverageFor({
            sets: [
                set({ id: 'bio-mini', subject: 'ESAT Biology', title: 'ESAT Biology — Mini Test' }),
                set({ id: 'bio-a', subject: 'ESAT Biology', title: 'ESAT Biology — Diagnostic Set A' }),
                set({ id: 'bio-b', subject: 'ESAT Biology', title: 'ESAT Biology — Diagnostic Set B', isFree: false }),
                set({ id: 'chem-mini', subject: 'ESAT Chemistry', title: 'ESAT Chemistry — Mini Test' }),
            ],
            attempts: [
                attempt({ setId: 'bio-mini', subject: 'ESAT Biology', answeredCount: 10, questionCount: 10 }),
            ],
        })

    it('puts every set for a module together', () => {
        const groups = groupCoverageBySubject(rows(), { billingLive: false })
        expect(groups.map((g) => g.subject)).toEqual(['ESAT Biology', 'ESAT Chemistry'])
        expect(groups[0].rows).toHaveLength(3)
    })

    it('counts only what a student could actually sit', () => {
        // Set B is behind a Season Pass nobody can buy yet. "1 of 2" is the
        // honest denominator; "1 of 3" would blame them for a locked paper.
        const groups = groupCoverageBySubject(rows(), { billingLive: false })
        expect(groups[0]).toMatchObject({ sat: 1, startable: 2 })
    })

    it('counts a locked set once billing is live', () => {
        const groups = groupCoverageBySubject(rows(), { billingLive: true })
        expect(groups[0]).toMatchObject({ sat: 1, startable: 3 })
    })

    it('reports a module with nothing startable rather than dividing by zero', () => {
        const locked = coverageFor({
            sets: [set({ id: 'x', subject: 'ESAT Physics', isFree: false })],
            attempts: [],
        })
        expect(groupCoverageBySubject(locked, { billingLive: false })[0]).toMatchObject({
            sat: 0,
            startable: 0,
        })
    })
})
