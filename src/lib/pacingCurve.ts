import type { PerQuestionTime } from '@/client'

/**
 * Pure logic + geometry for the pacing curve — no React/SVG, so the
 * three-state model and the null-break are unit-testable on their own.
 *
 * Three genuinely different stories get three treatments and can't be
 * confused: viewed-and-lingered (a point high on the curve),
 * viewed-briefly (a point low on the curve, filled), and never-reached
 * (no data — a broken curve + hollow marker). Never-reached is `time:
 * null`, NOT 0: drawing it as a 0-second point would imply the student
 * blazed through in no time (rushed) when they actually never got there —
 * the same fabricated-value trap the radar's polygon-break avoids, on the
 * time axis instead of score.
 */

export type PacingPoint = {
    /** 1-based question position in the paper sequence. */
    position: number
    /** Engaged seconds, or null when the question was never reached. */
    time: number | null
    /** Visits, or null when never reached. */
    viewCount: number | null
}

/**
 * Expand the report's per-question times (only questions with a response
 * row) into the full paper sequence, so the x-axis is the whole paper and
 * "the back third" is a real region. Positions with no entry are
 * never-reached (time null), distinct from a viewed question that happens
 * to be 0s.
 *
 * `questionCount` (the set's size) gives the true length; without it (set
 * preview not loaded yet) we fall back to the last viewed question, so the
 * curve still renders — degrade, don't block.
 */
export function buildPacingSeries(
    perQuestionTime: PerQuestionTime[],
    questionCount?: number
): PacingPoint[] {
    const byIndex = new Map(perQuestionTime.map((t) => [t.questionOrderIndex, t]))
    const maxIndex = perQuestionTime.reduce(
        (m, t) => Math.max(m, t.questionOrderIndex),
        -1
    )
    const length = Math.max(questionCount ?? 0, maxIndex + 1)

    const series: PacingPoint[] = []
    for (let i = 0; i < length; i += 1) {
        const entry = byIndex.get(i)
        series.push({
            position: i + 1,
            time: entry ? entry.totalTimeSeconds : null,
            viewCount: entry ? entry.viewCount : null,
        })
    }
    return series
}

/**
 * Index pairs [i, i+1] whose *both* endpoints were reached — the only
 * edges the curve draws. A never-reached position breaks the line on both
 * sides, so the curve is never drawn through a gap as if it were 0s. (A
 * sequence, not a ring — no wrap.)
 */
export function pacingSegments(series: PacingPoint[]): Array<[number, number]> {
    const segments: Array<[number, number]> = []
    for (let i = 0; i < series.length - 1; i += 1) {
        if (series[i].time !== null && series[i + 1].time !== null) {
            segments.push([i, i + 1])
        }
    }
    return segments
}

/** Median engaged time over *reached* questions — the "typical pace"
 * reference. Median, not mean, so one genuinely-stuck question can't drag
 * the line up and make normal pacing look fast. Null when nothing reached. */
export function medianTime(series: PacingPoint[]): number | null {
    const times = series
        .map((p) => p.time)
        .filter((t): t is number => t !== null)
        .sort((a, b) => a - b)
    if (times.length === 0) return null
    const mid = Math.floor(times.length / 2)
    return times.length % 2 === 0 ? (times[mid - 1] + times[mid]) / 2 : times[mid]
}

export type PacingLayout = {
    width: number
    height: number
    baselineY: number
    /** y of the median reference line, or null if nothing was reached. */
    medianY: number | null
    /** One entry per position, in sequence order. */
    nodes: Array<{
        position: number
        x: number
        /** y of the data point (reached), or null (never reached). */
        y: number | null
        baselineY: number
        time: number | null
        viewCount: number | null
        reached: boolean
    }>
    /** Line segments between adjacent reached nodes, as coordinate pairs. */
    lines: Array<{ x1: number; y1: number; x2: number; y2: number }>
}

export function pacingLayout(
    series: PacingPoint[],
    {
        width = 320,
        height = 180,
        padding = { top: 18, right: 16, bottom: 26, left: 16 },
    }: {
        width?: number
        height?: number
        padding?: { top: number; right: number; bottom: number; left: number }
    } = {}
): PacingLayout {
    const plotLeft = padding.left
    const plotRight = width - padding.right
    const plotTop = padding.top
    const baselineY = height - padding.bottom
    const plotHeight = baselineY - plotTop
    const n = series.length

    // Guard maxTime so all-zero (all viewed-briefly) doesn't divide by zero
    // — every point then sits on the baseline, which is the honest picture.
    const maxTime = Math.max(
        1,
        ...series.map((p) => (p.time !== null ? p.time : 0))
    )
    const xFor = (i: number) =>
        n <= 1 ? (plotLeft + plotRight) / 2 : plotLeft + (i / (n - 1)) * (plotRight - plotLeft)
    const yFor = (time: number) => baselineY - (time / maxTime) * plotHeight

    const nodes = series.map((p, i) => ({
        position: p.position,
        x: xFor(i),
        y: p.time !== null ? yFor(p.time) : null,
        baselineY,
        time: p.time,
        viewCount: p.viewCount,
        reached: p.time !== null,
    }))

    const lines = pacingSegments(series).map(([i, j]) => ({
        x1: nodes[i].x,
        y1: nodes[i].y as number,
        x2: nodes[j].x,
        y2: nodes[j].y as number,
    }))

    const median = medianTime(series)
    return {
        width,
        height,
        baselineY,
        medianY: median !== null ? yFor(median) : null,
        nodes,
        lines,
    }
}
