import { describe, expect, it } from 'vitest'
import { axisAngle, radarLayout, radarSegments } from './skillsRadarGeometry'
import type { SkillScore } from '@/client'

function skills(scores: Array<number | null>): SkillScore[] {
    return scores.map((score, i) => ({ skill: `S${i + 1}`, score }))
}

describe('axisAngle', () => {
    it('starts at the top (-90°) and steps clockwise', () => {
        expect(axisAngle(0, 7)).toBeCloseTo(-Math.PI / 2)
        expect(axisAngle(1, 7)).toBeCloseTo(-Math.PI / 2 + (2 * Math.PI) / 7)
    })
})

describe('radarSegments — the null-break', () => {
    it('connects every adjacent pair (with wrap) when all are assessed', () => {
        const segs = radarSegments(skills([0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]))
        expect(segs).toEqual([
            [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0],
        ])
    })

    it('breaks the outline around a null axis — no edge spans it', () => {
        // S4 (index 3) is null: neither [2,3] nor [3,4] may be drawn, so no
        // edge crosses S4's spoke.
        const segs = radarSegments(skills([0.5, 0.5, 0.5, null, 0.5, 0.5, 0.5]))
        expect(segs).toEqual([[0, 1], [1, 2], [4, 5], [5, 6], [6, 0]])
        expect(segs).not.toContainEqual([2, 3])
        expect(segs).not.toContainEqual([3, 4])
    })

    it('draws no segments when assessed axes are non-adjacent (honest dots-only)', () => {
        // Assessed at 0, 2, 5 — no two are neighbours.
        const segs = radarSegments(skills([0.5, null, 0.5, null, null, 0.5, null]))
        expect(segs).toEqual([])
    })

    it('draws nothing when nothing is assessed', () => {
        expect(radarSegments(skills([null, null, null, null, null, null, null]))).toEqual([])
    })

    it('treats an assessed 0 as assessed (it connects), distinct from null', () => {
        // S1=0 and S2=0.4 are both assessed and adjacent -> connected.
        const segs = radarSegments(skills([0, 0.4, null, null, null, null, null]))
        expect(segs).toContainEqual([0, 1])
    })
})

describe('radarLayout', () => {
    const layout = radarLayout(skills([1, 0, null, 0.5, null, null, null]), { size: 300 })

    it('gives an assessed axis a dot and a null axis none', () => {
        expect(layout.axes[0].dot).not.toBeNull() // S1 assessed
        expect(layout.axes[2].dot).toBeNull() // S3 null -> no dot
        expect(layout.axes[0].assessed).toBe(true)
        expect(layout.axes[2].assessed).toBe(false)
    })

    it('plots an assessed 0 as a real dot at the centre (not omitted like null)', () => {
        const s2 = layout.axes[1] // score 0
        expect(s2.dot).not.toBeNull()
        expect(s2.dot!.x).toBeCloseTo(layout.center.x)
        expect(s2.dot!.y).toBeCloseTo(layout.center.y)
    })

    it('plots a full score at the outer radius on the top axis', () => {
        const s1 = layout.axes[0] // score 1, axis 0 = straight up
        expect(s1.dot!.x).toBeCloseTo(layout.center.x)
        expect(s1.dot!.y).toBeCloseTo(layout.center.y - layout.radius)
    })

    it('emits one grid ring polygon per level, each with all seven vertices', () => {
        expect(layout.rings).toHaveLength(4)
        // 7 "x,y" pairs per ring.
        expect(layout.rings[0].trim().split(/\s+/)).toHaveLength(7)
    })
})
