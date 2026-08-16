import { describe, expect, it } from 'vitest'
import {
    normalizeSubject,
    frameworkFor,
    skillName,
} from './diagnosticSkillFrameworks'

describe('normalizeSubject', () => {
    it('folds Maths/Math drift and casing to one key', () => {
        expect(normalizeSubject('ESAT Maths 2')).toBe('esat math 2')
        expect(normalizeSubject('ESAT Math 2')).toBe('esat math 2')
        expect(normalizeSubject('  esat   maths 1 ')).toBe('esat math 1')
    })
})

describe('skillName', () => {
    it('decodes the SAME code differently per subject', () => {
        // The trap the brief calls out: Physics S3 ≠ Maths S3.
        expect(skillName('ESAT Physics', 'S3')).toBe(
            'Proportional & Ratio Reasoning'
        )
        expect(skillName('ESAT Math 2', 'S3')).toBe(
            'Graphical & Geometric Reasoning'
        )
    })

    it('resolves Maths 1 / Maths 2 / Physics via the drifted real names', () => {
        expect(skillName('ESAT Maths 1', 'S1')).toBe(
            'Algebraic Manipulation & Fluency'
        )
        expect(skillName('ESAT Math 2', 'S6')).toBe('Calculus & Rate of Change')
        expect(skillName('ESAT Physics', 'S6')).toBe(
            'Units & Dimensional Reasoning'
        )
    })

    it('falls back to the bare code for an unknown subject or code', () => {
        expect(skillName('Chemistry', 'S1')).toBe('S1')
        expect(skillName(null, 'S1')).toBe('S1')
        expect(skillName('ESAT Physics', 'S9')).toBe('S9')
    })
})

describe('frameworkFor', () => {
    it('gives Maths 1 no S6 (no calculus), but Maths 2 does', () => {
        expect(frameworkFor('ESAT Maths 1')).not.toHaveProperty('S6')
        expect(frameworkFor('ESAT Math 2')).toHaveProperty('S6')
    })

    it('is null for an unrecognised subject', () => {
        expect(frameworkFor('Biology')).toBeNull()
    })
})

describe('TMUA frameworks', () => {
    it('names all nine Paper 1 skills', () => {
        expect(skillName('TMUA Paper 1', 'S1')).toContain(
            'Algebraic Manipulation'
        )
        expect(skillName('TMUA Paper 1', 'S8')).toContain('Calculus')
        expect(skillName('TMUA Paper 1', 'S9')).toContain('Graphs & Functions')
    })

    it('names all eight Paper 2 skills, distinctly from Paper 1', () => {
        expect(skillName('TMUA Paper 2', 'S2')).toBe(
            'Necessary & Sufficient Conditions'
        )
        expect(skillName('TMUA Paper 2', 'S8')).toContain(
            'Computational Fluency'
        )
        // Same code, different paper, different meaning.
        expect(skillName('TMUA Paper 2', 'S5')).not.toBe(
            skillName('TMUA Paper 1', 'S5')
        )
    })

    it('leaves the ESAT Maths taxonomy untouched', () => {
        // The docx says Paper 1 shares ESAT Maths 2's spec, but the existing
        // ESAT questions are tagged against the abstract names — reusing the
        // TMUA labels would re-interpret every historic tag.
        expect(skillName('ESAT Math 2', 'S2')).toBe(
            'Strategic & Efficient Problem Solving'
        )
    })

    it('still falls back to the bare code for an unknown subject', () => {
        expect(skillName('TMUA Paper 3', 'S1')).toBe('S1')
    })
})

describe('the two subjects that had no framework', () => {
    // Biology and Chemistry radars rendered bare S-codes to paying students —
    // skillName falls back to the code, so it degraded silently rather than
    // breaking, which is why it went unnoticed.
    it('names Chemistry skills natively, not by borrowing Physics', () => {
        expect(skillName('ESAT Chemistry', 'S2')).toBe(
            'Mole & Proportional Reasoning'
        )
        expect(skillName('ESAT Chemistry', 'S2')).not.toBe(
            skillName('ESAT Physics', 'S2')
        )
    })

    it('gives Biology all eight axes', () => {
        const framework = frameworkFor('ESAT Biology')
        expect(Object.keys(framework ?? {})).toHaveLength(8)
        expect(skillName('ESAT Biology', 'S8')).toBe(
            'Systems & Pathway Tracing'
        )
    })

    it('no longer falls back to the bare code for either', () => {
        for (const subject of ['ESAT Biology', 'ESAT Chemistry']) {
            expect(skillName(subject, 'S1')).not.toBe('S1')
        }
    })
})
