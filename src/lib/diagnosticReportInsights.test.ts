import { describe, expect, it } from 'vitest'
import { buildReportInsights } from './diagnosticReportInsights'
import type { SkillScore } from '@/client'

const SUBJECT = 'ESAT Math 2'

function s(skill: string, correct: number, attempted: number): SkillScore {
    return {
        skill,
        attempted,
        correct,
        score: attempted === 0 ? null : correct / attempted,
    }
}

describe('buildReportInsights', () => {
    it('excludes not-measured skills entirely (never as a strength or focus)', () => {
        const skills = [s('S1', 5, 6), s('S3', 0, 0)] // S3 not measured
        const { strengths, focusAreas } = buildReportInsights(skills, SUBJECT, 5, 6)
        const all = [...strengths, ...focusAreas].map((i) => i.code)
        expect(all).not.toContain('S3')
    })

    it('names strengths in full and requires a reliable, high score', () => {
        const skills = [
            s('S1', 5, 6), // 83%, reliable -> strength
            s('S7', 2, 2), // 100% but only 2 questions -> NOT a confident strength
        ]
        const { strengths } = buildReportInsights(skills, SUBJECT, 7, 8)
        expect(strengths.map((i) => i.code)).toEqual(['S1'])
        expect(strengths[0].name).toBe('Algebraic Manipulation & Fluency')
    })

    it('lists focus areas lowest-first with denominator and limited-data flag', () => {
        const skills = [
            s('S1', 5, 6), // 83% -> strength, not focus
            s('S3', 1, 4), // 25%
            s('S5', 0, 1), // 0%, single question -> limited data
        ]
        const { focusAreas } = buildReportInsights(skills, SUBJECT, 6, 11)
        expect(focusAreas.map((i) => i.code)).toEqual(['S5', 'S3']) // lowest first
        const s5 = focusAreas[0]
        expect(s5.pct).toBe(0)
        expect(s5.attempted).toBe(1)
        expect(s5.limitedData).toBe(true) // < 3 questions
        expect(focusAreas[1].limitedData).toBe(false) // S3 had 4
    })

    it('keeps a genuine 0% (attempted>0) as a focus area, unlike n/a', () => {
        const skills = [s('S2', 0, 3), s('S4', 0, 0)] // S2 real 0%, S4 not measured
        const { focusAreas } = buildReportInsights(skills, SUBJECT, 0, 3)
        expect(focusAreas.map((i) => i.code)).toEqual(['S2'])
        expect(focusAreas[0].pct).toBe(0)
    })

    it('scores the headline against the whole paper, not what was reached', () => {
        // The sentence sits directly under a card reading "9/27 correct". If
        // it said "9 of 10" the two would disagree, and the flattering one
        // would be the one written in words.
        const h = buildReportInsights([s('S1', 9, 10)], SUBJECT, 9, 10, 27).headline
        expect(h).toContain('9 out of 27')
        expect(h).toContain('17 left unanswered')
        expect(h).not.toContain('9 out of 10')
    })

    it('says nothing about unanswered questions when the paper was finished', () => {
        const h = buildReportInsights([s('S1', 9, 10)], SUBJECT, 9, 10, 10).headline
        expect(h).toContain('9 out of 10')
        expect(h).not.toMatch(/unanswered/i)
    })

    it('falls back to what was attempted when the set size is unknown', () => {
        // No paperTotal available: score against attempted rather than
        // invent a denominator.
        const h = buildReportInsights([s('S1', 9, 10)], SUBJECT, 9, 10).headline
        expect(h).toContain('9 out of 10')
    })

    it('grades the tone from the paper total, not the attempted total', () => {
        // 9 of 10 attempted is "strong"; the same 9 on a 27-question paper
        // is not, and the verdict has to move with the real ratio.
        expect(
            buildReportInsights([s('S1', 9, 10)], SUBJECT, 9, 10, 10).headline
        ).toMatch(/strong result/i)
        expect(
            buildReportInsights([s('S1', 9, 10)], SUBJECT, 9, 10, 27).headline
        ).toMatch(/starting point/i)
    })

    it('adapts the headline to the score, never bare numbers', () => {
        expect(buildReportInsights([], SUBJECT, 0, 0).headline).toMatch(/didn't answer/i)
        expect(buildReportInsights([s('S1', 9, 10)], SUBJECT, 9, 10).headline).toMatch(
            /strong result/i
        )
        expect(buildReportInsights([s('S1', 5, 10)], SUBJECT, 5, 10).headline).toMatch(
            /solid base/i
        )
    })
})
