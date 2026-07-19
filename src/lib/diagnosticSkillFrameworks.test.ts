import { describe, expect, it } from 'vitest'
import { normalizeSubject, frameworkFor, skillName } from './diagnosticSkillFrameworks'

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
        expect(skillName('ESAT Physics', 'S3')).toBe('Proportional & Ratio Reasoning')
        expect(skillName('ESAT Math 2', 'S3')).toBe('Graphical & Geometric Reasoning')
    })

    it('resolves Maths 1 / Maths 2 / Physics via the drifted real names', () => {
        expect(skillName('ESAT Maths 1', 'S1')).toBe('Algebraic Manipulation & Fluency')
        expect(skillName('ESAT Math 2', 'S6')).toBe('Calculus & Rate of Change')
        expect(skillName('ESAT Physics', 'S6')).toBe('Units & Dimensional Reasoning')
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
