import { describe, expect, it } from 'vitest'
import type { PacingSummary } from '@/client/types.gen'
import { buildClockStory, spokenDuration } from './clockStory'

function pacing(over: Partial<PacingSummary> = {}): PacingSummary {
    return {
        allowanceSeconds: 89,
        slowAfterSeconds: 178,
        ranOut: false,
        spareSeconds: 0,
        engagedSeconds: 2000,
        slowCount: 0,
        slowSeconds: 0,
        excessSeconds: 0,
        slowQuestions: [],
        ...over,
    }
}

describe('spokenDuration', () => {
    it('says durations the way they are said', () => {
        expect(spokenDuration(42)).toBe('42 s')
        expect(spokenDuration(89)).toBe('1 min 29 s')
        expect(spokenDuration(360)).toBe('6 min')
        expect(spokenDuration(370)).toBe('6 min 10 s')
    })
})

describe('buildClockStory', () => {
    it('says nothing without a summary or without an answer', () => {
        expect(buildClockStory(null, { answeredCount: 5, unanswered: 0 })).toBeNull()
        expect(buildClockStory(pacing(), { answeredCount: 0, unanswered: 27 })).toBeNull()
    })

    it('ran out because of a few slow questions: names them, their cost, and what to do', () => {
        const story = buildClockStory(
            pacing({
                ranOut: true,
                slowCount: 2,
                slowSeconds: 670,
                excessSeconds: 670 - 178,
                slowQuestions: [
                    { questionOrderIndex: 6, seconds: 370, outcome: 'wrong' },
                    { questionOrderIndex: 11, seconds: 300, outcome: 'right' },
                ],
            }),
            { answeredCount: 23, unanswered: 4 }
        )!
        expect(story.lead).toBe('The clock ran out with 4 questions unanswered.')
        expect(story.detail).toBe(
            'Two questions took more than twice the 1 min 29 s a question your time allows: ' +
                'Q7 (6 min 10 s, wrong) and Q12 (5 min, right). ' +
                "Together they took 8 min 12 s more than their share, enough time to have reached the 4 you didn't."
        )
        expect(story.tip).toMatch(/no negative marking/)
        expect(story.tip).toMatch(/passes 2 min 58 s/)
    })

    it('says "the longest were" when there are more slow questions than it names', () => {
        const story = buildClockStory(
            pacing({
                ranOut: true,
                slowCount: 5,
                excessSeconds: 400,
                slowQuestions: [
                    { questionOrderIndex: 0, seconds: 300, outcome: 'right' },
                    { questionOrderIndex: 1, seconds: 250, outcome: 'blank' },
                    { questionOrderIndex: 2, seconds: 200, outcome: 'wrong' },
                ],
            }),
            { answeredCount: 20, unanswered: 7 }
        )!
        expect(story.detail).toMatch(/^Five questions took more than twice/)
        expect(story.detail).toMatch(/The longest were Q1 \(5 min, right\), Q2 \(4 min 10 s, left blank\) and Q3/)
        // 400 s is four questions' worth, short of the seven left.
        expect(story.detail).toMatch(/about 4 questions' worth of time\.$/)
    })

    it('answered everything but used all the time: does not say they ran out short', () => {
        const story = buildClockStory(
            pacing({
                ranOut: true,
                slowCount: 1,
                excessSeconds: 130,
                slowQuestions: [{ questionOrderIndex: 20, seconds: 219, outcome: 'wrong' }],
            }),
            { answeredCount: 27, unanswered: 0 }
        )!
        expect(story.lead).toBe('You answered every question and used all of the time.')
        expect(story.detail).toMatch(/about one question's worth of time\.$/)
    })

    it('ran out with nothing slow: the pace itself was the problem', () => {
        const story = buildClockStory(
            pacing({ ranOut: true, engagedSeconds: 2300 }),
            { answeredCount: 23, unanswered: 4 }
        )!
        expect(story.detail).toBe(
            'No single question ran away with the time: you spent about 1 min 40 s on each question you answered, against the 1 min 29 s your time allows.'
        )
        expect(story.tip).toMatch(/a guess beats a blank/)
    })

    it('finished early with questions left: the cheapest marks there are', () => {
        const story = buildClockStory(pacing({ spareSeconds: 420 }), {
            answeredCount: 24,
            unanswered: 3,
        })!
        expect(story.lead).toBe('You finished with 7 minutes left and 3 questions unanswered.')
        expect(story.tip).toMatch(/put an answer on every question/)
    })

    it('finished in time with a slow question: a warning, not a telling-off', () => {
        const story = buildClockStory(
            pacing({
                spareSeconds: 125,
                slowCount: 1,
                slowQuestions: [{ questionOrderIndex: 8, seconds: 240, outcome: 'right' }],
            }),
            { answeredCount: 27, unanswered: 0 }
        )!
        expect(story.lead).toBe('You finished with 2 minutes to spare.')
        expect(story.detail).toMatch(/^One question took more than twice .*: Q9 \(4 min, right\)\. Fine today/)
    })

    it('finished in time with nothing slow: time was not the problem', () => {
        const story = buildClockStory(pacing({ spareSeconds: 30 }), {
            answeredCount: 27,
            unanswered: 0,
        })!
        expect(story.lead).toBe('You finished with under a minute to spare.')
        expect(story.detail).toMatch(/Time wasn't the problem on this paper\.$/)
    })
})
