import { describe, expect, it } from 'vitest'
import {
    buildPacingSeries,
    medianTime,
    pacingLayout,
    pacingSegments,
    type PacingPoint,
} from './pacingCurve'
import type { PerQuestionTime } from '@/client'

function t(questionOrderIndex: number, totalTimeSeconds: number, viewCount = 1): PerQuestionTime {
    return { questionId: `q${questionOrderIndex}`, questionOrderIndex, totalTimeSeconds, viewCount }
}

function series(times: Array<number | null>): PacingPoint[] {
    return times.map((time, i) => ({
        position: i + 1,
        time,
        viewCount: time === null ? null : 1,
    }))
}

describe('buildPacingSeries', () => {
    it('expands entries into the full paper, gaps as never-reached (null, not 0)', () => {
        // Set of 4; only Q1 and Q3 have entries. Q2 and Q4 were never reached.
        const s = buildPacingSeries([t(0, 30), t(2, 12)], 4)
        expect(s.map((p) => p.time)).toEqual([30, null, 12, null])
        expect(s.map((p) => p.position)).toEqual([1, 2, 3, 4])
        // never-reached carries null viewCount too (no data at all).
        expect(s[1].viewCount).toBeNull()
    })

    it('keeps a viewed-0 question as a real 0, distinct from never-reached null', () => {
        const s = buildPacingSeries([t(0, 0, 1), t(1, 20)], 2)
        expect(s[0].time).toBe(0) // viewed briefly, not null
        expect(s[0].viewCount).toBe(1)
    })

    it('falls back to the last viewed question when set size is unknown', () => {
        const s = buildPacingSeries([t(0, 10), t(2, 5)]) // no questionCount
        expect(s).toHaveLength(3) // through the last entry; still shows the mid gap
        expect(s[1].time).toBeNull()
    })
})

describe('pacingSegments — break at never-reached', () => {
    it('connects adjacent reached questions and breaks around a gap', () => {
        // reached, reached, GAP, reached
        expect(pacingSegments(series([10, 20, null, 30]))).toEqual([[0, 1]])
    })

    it('connects across a viewed-0 (0s is reached, not a gap)', () => {
        expect(pacingSegments(series([10, 0, 20]))).toEqual([[0, 1], [1, 2]])
    })

    it('draws nothing when reached questions are non-adjacent', () => {
        expect(pacingSegments(series([10, null, 20, null, 30]))).toEqual([])
    })
})

describe('medianTime — typical pace, outlier-resistant', () => {
    it('is the middle of the reached times', () => {
        expect(medianTime(series([10, 12, 11]))).toBe(11)
    })

    it('averages the two middle values for an even count', () => {
        expect(medianTime(series([10, 12, 11, 13]))).toBe(11.5)
    })

    it('is not dragged up by a single stuck question (unlike a mean)', () => {
        // One 300s outlier among ~11s questions: median stays ~11.5, where a
        // mean would jump past 80.
        const med = medianTime(series([10, 11, 12, 300]))
        expect(med).toBe(11.5)
    })

    it('ignores never-reached and is null when nothing was reached', () => {
        expect(medianTime(series([null, 20, null]))).toBe(20)
        expect(medianTime(series([null, null]))).toBeNull()
    })
})

describe('pacingLayout', () => {
    const layout = pacingLayout(series([40, null, 10]), { width: 320, height: 180 })

    it('gives reached nodes a y and never-reached nodes none', () => {
        expect(layout.nodes[0].reached).toBe(true)
        expect(layout.nodes[0].y).not.toBeNull()
        expect(layout.nodes[1].reached).toBe(false)
        expect(layout.nodes[1].y).toBeNull()
    })

    it('places more time higher (smaller y) than less time', () => {
        expect(layout.nodes[0].y as number).toBeLessThan(layout.nodes[2].y as number)
    })

    it('only draws lines between adjacent reached nodes (none across the gap)', () => {
        expect(layout.lines).toHaveLength(0) // 0 and 2 aren't adjacent
    })

    it('has a median reference line when something was reached', () => {
        expect(layout.medianY).not.toBeNull()
    })

    it('has no median line when nothing was reached', () => {
        const empty = pacingLayout(series([null, null]))
        expect(empty.medianY).toBeNull()
    })
})
