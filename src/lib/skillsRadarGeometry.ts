import type { SkillScore } from '@/client'

/**
 * Pure geometry for the Skills Radar — no React, no SVG, so the layout
 * math (and, critically, the null-handling) is unit-testable on its own.
 *
 * The one correctness-load-bearing decision lives in `radarSegments`: the
 * connecting outline is *broken* at any not-assessed axis, so no edge ever
 * spans a null axis. A straight edge drawn from S3 to S5 across a null S4
 * would cross S4's spoke at some radius and read as a fabricated S4 score;
 * omitting that edge is what keeps "not assessed" from implying a value.
 * When assessed axes aren't adjacent, there are simply no segments and the
 * radar honestly degrades to dots-on-axes.
 */

export type Point = { x: number; y: number }

export type RadarAxis = {
    skill: string
    /** null score === not assessed by this paper (distinct from a real 0). */
    assessed: boolean
    /** Spoke tip, at full radius — always present (the axis always exists). */
    axisEnd: Point
    /** Data point at radius ∝ score. Null for a not-assessed axis — no dot. */
    dot: Point | null
    /** Where the axis label sits, just outside the spoke tip. */
    label: Point
    /** Horizontal text-anchor for the label, from its side of the circle. */
    labelAnchor: 'start' | 'middle' | 'end'
}

export type RadarLayout = {
    size: number
    center: Point
    radius: number
    axes: RadarAxis[]
    /** Concentric grid polygons (one point string per level). */
    rings: string[]
    /** Index pairs [i, j] whose data dots should be connected. */
    segments: Array<[number, number]>
}

/** Angle of axis `i` of `count`, starting at the top and going clockwise. */
export function axisAngle(index: number, count: number): number {
    return -Math.PI / 2 + (index * 2 * Math.PI) / count
}

function pointAt(center: Point, radius: number, angle: number, fraction: number): Point {
    return {
        x: center.x + radius * fraction * Math.cos(angle),
        y: center.y + radius * fraction * Math.sin(angle),
    }
}

/**
 * Adjacent pairs (in ring order, wrapping) whose *both* endpoints are
 * assessed — the only edges the outline draws. A null axis breaks the ring
 * on both sides, so no drawn edge ever crosses it.
 */
export function radarSegments(skills: SkillScore[]): Array<[number, number]> {
    const n = skills.length
    const assessed = (i: number) =>
        skills[i].score !== null && skills[i].score !== undefined
    const segments: Array<[number, number]> = []
    for (let i = 0; i < n; i += 1) {
        const j = (i + 1) % n
        if (n > 1 && assessed(i) && assessed(j)) segments.push([i, j])
    }
    return segments
}

/**
 * Full layout for `skills` in a `size`×`size` box. `padding` reserves room
 * for the labels outside the outer ring.
 */
export function radarLayout(
    skills: SkillScore[],
    { size = 300, padding = 44, levels = 4 }: { size?: number; padding?: number; levels?: number } = {}
): RadarLayout {
    const center: Point = { x: size / 2, y: size / 2 }
    const radius = size / 2 - padding
    const n = skills.length

    const axes: RadarAxis[] = skills.map((s, i) => {
        const angle = axisAngle(i, n)
        const assessed = s.score !== null && s.score !== undefined
        const label = pointAt(center, radius, angle, 1.18)
        const cos = Math.cos(angle)
        const labelAnchor: RadarAxis['labelAnchor'] =
            Math.abs(cos) < 0.34 ? 'middle' : cos > 0 ? 'start' : 'end'
        return {
            skill: s.skill,
            assessed,
            axisEnd: pointAt(center, radius, angle, 1),
            dot: assessed ? pointAt(center, radius, angle, s.score as number) : null,
            label,
            labelAnchor,
        }
    })

    const rings: string[] = []
    for (let level = 1; level <= levels; level += 1) {
        const fraction = level / levels
        rings.push(
            skills
                .map((_, i) => {
                    const p = pointAt(center, radius, axisAngle(i, n), fraction)
                    return `${p.x.toFixed(2)},${p.y.toFixed(2)}`
                })
                .join(' ')
        )
    }

    return { size, center, radius, axes, rings, segments: radarSegments(skills) }
}
