import { describe, expect, it } from 'vitest'
import { SAMPLES_BY_SUBJECT, samplesFor } from './diagnosticSamples.mjs'
import { GUIDES } from './guides.mjs'

/**
 * These questions are shown to anyone, signed in or not. What they must not
 * be is any of the 27 a student is scored on.
 */
describe('the public sample questions', () => {
    const all = Object.values(SAMPLES_BY_SUBJECT)

    it('gives every paper it covers exactly two', () => {
        // Two is the point: enough to judge the format, not enough to be a
        // practice set of its own.
        for (const subject of all) expect(subject.questions).toHaveLength(2)
    })

    it('offers four options and no answer', () => {
        for (const subject of all) {
            for (const question of subject.questions) {
                expect(question.options).toHaveLength(4)
                // No correct-answer field anywhere: the page shows what the
                // paper asks, and the guides do the teaching.
                expect(Object.keys(question).sort()).toEqual(['options', 'stem'])
            }
        }
    })

    it('points each paper at a guide that exists', () => {
        const paths = new Set(GUIDES.map((g) => g.path))
        for (const subject of all) expect(paths).toContain(subject.guidePath)
    })

    it('has no duplicate question across papers', () => {
        const stems = all.flatMap((s) => s.questions.map((q) => q.stem))
        expect(new Set(stems).size).toBe(stems.length)
    })

    it('has distinct options within a question', () => {
        // A repeated option is a giveaway and reads as a mistake.
        for (const subject of all) {
            for (const question of subject.questions) {
                expect(new Set(question.options).size).toBe(
                    question.options.length
                )
            }
        }
    })

    it('returns nothing for a paper with no samples yet, rather than throwing', () => {
        // TMUA has none written. The page must degrade to the summary and
        // the sign-in prompt, not break.
        expect(samplesFor('TMUA Paper 1')).toBeNull()
        expect(samplesFor(undefined)).toBeNull()
        expect(samplesFor('Something Else')).toBeNull()
    })
})
