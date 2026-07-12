import { describe, expect, it } from 'vitest'
import {
    formatDuration,
    questionLabelByIdFrom,
    skillPercent,
} from './diagnosticReport'
import type { PerQuestionTime } from '@/client'

function pqt(over: Partial<PerQuestionTime>): PerQuestionTime {
    return {
        questionId: 'q',
        questionOrderIndex: 0,
        totalTimeSeconds: 0,
        viewCount: 0,
        ...over,
    }
}

describe('formatDuration', () => {
    it('formats seconds as m:ss with zero-padding', () => {
        expect(formatDuration(0)).toBe('0:00')
        expect(formatDuration(42)).toBe('0:42')
        expect(formatDuration(65)).toBe('1:05')
        expect(formatDuration(723)).toBe('12:03')
    })
    it('clamps and rounds', () => {
        expect(formatDuration(-5)).toBe('0:00')
        expect(formatDuration(59.6)).toBe('1:00')
    })
})

describe('questionLabelByIdFrom', () => {
    it('maps question ids to 1-based labels via order index', () => {
        const labels = questionLabelByIdFrom([
            pqt({ questionId: 'qa', questionOrderIndex: 0 }),
            pqt({ questionId: 'qc', questionOrderIndex: 2 }),
        ])
        expect(labels.get('qa')).toBe('Question 1')
        expect(labels.get('qc')).toBe('Question 3')
        expect(labels.get('missing')).toBeUndefined()
    })
})

describe('skillPercent', () => {
    it('scales 0–1 to an integer percent', () => {
        expect(skillPercent(1)).toBe(100)
        expect(skillPercent(2 / 3)).toBe(67)
        expect(skillPercent(0)).toBe(0)
    })
    it('preserves null/undefined (not assessed) as null — distinct from 0', () => {
        expect(skillPercent(null)).toBeNull()
        expect(skillPercent(undefined)).toBeNull()
    })
})
