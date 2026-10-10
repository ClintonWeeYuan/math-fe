import { describe, expect, it } from 'vitest'
import {
    formatSpent,
    groupAction,
    groupMeta,
    outcomeClosing,
    outcomeDetail,
    outcomeHeadline,
    outcomeStatus,
    queuedChip,
    queuedSentence,
    type RedemptionGroup,
    type RedemptionOutcome,
} from './redemption'

/**
 * The wording of the three redemption screens, as agreed on the review page
 * of 10 October 2026. Pure functions, so the copy is pinned without rendering.
 */

const group = (over: Partial<RedemptionGroup> = {}): RedemptionGroup => ({
    sourceSetId: 'set-1',
    title: 'ESAT Maths 1 — Set A',
    subject: 'ESAT Maths 1',
    isFree: true,
    questionCount: 6,
    wrongCount: 4,
    blankCount: 0,
    slowCount: 2,
    readyCount: 6,
    batchSize: 6,
    batchMinutes: 9,
    unlocksAt: null,
    latestSourceSubmittedAt: '2026-10-10T12:00:00Z',
    ...over,
})

const outcome = (over: Partial<RedemptionOutcome> = {}): RedemptionOutcome => ({
    questionId: 'q',
    questionOrderIndex: 0,
    sourceOrderIndex: 6,
    reason: 'wrong',
    cycle: 1,
    originalSeconds: 120,
    redeemedSeconds: 125,
    isCorrect: true,
    outcome: 'redeemed',
    nextAvailableFrom: null,
    ...over,
})

describe('spent time reads as words', () => {
    it('formats minutes and seconds', () => {
        expect(formatSpent(250)).toBe('4 min 10 s')
        expect(formatSpent(45)).toBe('45 s')
        expect(formatSpent(60)).toBe('1 min 00 s')
    })
})

describe('the report card', () => {
    it('counts what was kept and why', () => {
        expect(
            queuedSentence({ count: 6, wrongCount: 4, blankCount: 0, slowCount: 2, items: [] })
        ).toBe(
            "We've kept 6 questions from this paper for you to try again: 4 you got wrong and 2 that took a while."
        )
    })

    it('lists blanks between wrong and slow, and handles one question', () => {
        expect(
            queuedSentence({ count: 3, wrongCount: 1, blankCount: 1, slowCount: 1, items: [] })
        ).toBe(
            "We've kept 3 questions from this paper for you to try again: 1 you got wrong, 1 you left blank and 1 that took a while."
        )
        expect(
            queuedSentence({ count: 1, wrongCount: 0, blankCount: 0, slowCount: 1, items: [] })
        ).toBe(
            "We've kept 1 question from this paper for you to try again: 1 that took a while."
        )
    })

    it('labels chips by paper position', () => {
        expect(queuedChip({ questionId: 'a', questionOrderIndex: 2, reason: 'wrong', originalSeconds: 90 })).toBe('Q3 · wrong')
        expect(queuedChip({ questionId: 'a', questionOrderIndex: 11, reason: 'blank', originalSeconds: 0 })).toBe('Q12 · left blank')
        expect(queuedChip({ questionId: 'a', questionOrderIndex: 13, reason: 'slow', originalSeconds: 250 })).toBe('Q14 · 4 min 10 s')
    })
})

describe('the results card', () => {
    it('describes a sitting that fits in one go', () => {
        expect(groupMeta(group())).toBe('6 questions · 9 min · from your paper on 10 October')
        expect(groupAction(group())).toBe('Redeem 6 questions →')
    })

    it('says when the queue is bigger than one sitting', () => {
        const big = group({ questionCount: 13, readyCount: 13, batchSize: 10, batchMinutes: 15 })
        expect(groupMeta(big)).toBe(
            '13 questions · first 10 in 15 min, 3 more will wait · from your paper on 10 October'
        )
        expect(groupAction(big)).toBe('Redeem the first 10 →')
    })

    it('has no minutes to promise while locked', () => {
        expect(groupMeta(group({ readyCount: 0, batchSize: 0, batchMinutes: 0 }))).toBe(
            '6 questions · from your paper on 10 October'
        )
    })
})

describe('the redemption report', () => {
    it('counts redeemed questions in the headline', () => {
        expect(
            outcomeHeadline([outcome(), outcome({ outcome: 'requeued' }), outcome()])
        ).toBe('2 of 3 redeemed')
    })

    it('says what happened to each question', () => {
        expect(outcomeStatus(outcome())).toBe('Redeemed')
        expect(outcomeDetail(outcome())).toBe('Right, in 2 min 05 s')
        expect(outcomeDetail(outcome({ reason: 'slow', originalSeconds: 250, redeemedSeconds: 160 }))).toBe(
            'Right, in 2 min 40 s · was 4 min 10 s'
        )

        const requeuedWrong = outcome({
            outcome: 'requeued', isCorrect: false, nextAvailableFrom: '2026-10-31T12:00:00Z',
        })
        expect(outcomeStatus(requeuedWrong)).toBe('Not yet')
        expect(outcomeDetail(requeuedWrong)).toBe('Wrong again · back in the queue, ready 31 October')

        expect(
            outcomeDetail(outcome({
                outcome: 'requeued', isCorrect: true, redeemedSeconds: 230,
                nextAvailableFrom: '2026-10-31T12:00:00Z',
            }))
        ).toBe('Right, but 3 min 50 s · back in the queue, ready 31 October')

        expect(
            outcomeDetail(outcome({ outcome: 'requeued', isCorrect: null, nextAvailableFrom: '2026-10-31T12:00:00Z' }))
        ).toBe('Left blank · back in the queue, ready 31 October')

        const retired = outcome({ outcome: 'retired', isCorrect: false, cycle: 2 })
        expect(outcomeStatus(retired)).toBe('Retired')
        expect(outcomeDetail(retired)).toBe(
            "Missed twice · worth going through with a teacher. It's in your review below."
        )
    })

    it('closes with what comes next', () => {
        expect(outcomeClosing([outcome(), outcome()])).toBe(
            "All 2 redeemed. That's the paper's hardest questions for you, done at pace."
        )
        expect(
            outcomeClosing([outcome(), outcome(), outcome(), outcome(), outcome({ outcome: 'requeued' }), outcome({ outcome: 'requeued' })])
        ).toBe(
            "Four down. The 2 going back in the queue will come round again in a fortnight — read the worked solutions below while they're fresh."
        )
        expect(outcomeClosing([outcome(), outcome({ outcome: 'retired' })])).toBe(
            'One down. The rest are retired — worth a session with a teacher. Their worked solutions are below.'
        )
    })
})
