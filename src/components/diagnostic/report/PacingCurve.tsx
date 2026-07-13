import type { PerQuestionTime } from '@/client'
import { buildPacingSeries, pacingLayout } from '@/lib/pacingCurve.ts'
import { formatDuration } from '@/lib/diagnosticReport.ts'

type Props = {
    perQuestionTime: PerQuestionTime[]
    /** The set's full size, for the whole-paper x-axis. Absent while the
     * set preview is still loading — the curve degrades to the questions it
     * has rather than blocking. */
    questionCount?: number
    width?: number
    height?: number
}

/**
 * Pacing curve (§6): engaged time per question across the paper sequence,
 * built to make "rushed the back third" legible — a line encodes slope
 * directly, and the median reference line makes the curve dropping below
 * typical pace toward the end read at a glance. No fabricated trend: real
 * points, straight segments, and a flat curve honestly shows no pattern.
 *
 * Three distinct states, three treatments that can't blur:
 *  - time = y-position (lingered = high, brief = low);
 *  - viewCount = a discrete "×N" revisit tag, never mixed into height, so
 *    thrice-briefly (low + ×3) can't look like once-at-length (high);
 *  - never-reached = a hollow marker with the curve broken around it, NOT
 *    a 0-second point (which would imply rushing, not absence).
 *
 * SVG decorative (aria-hidden); data reaches AT via the visually-hidden
 * <table>.
 */
export function PacingCurve({
    perQuestionTime,
    questionCount,
    width = 320,
    height = 180,
}: Props) {
    const series = buildPacingSeries(perQuestionTime, questionCount)
    const layout = pacingLayout(series, { width, height })

    return (
        <figure className="m-0 flex flex-col gap-2">
            <svg
                aria-hidden="true"
                viewBox={`0 0 ${width} ${height}`}
                className="w-full"
            >
                {/* baseline */}
                <line
                    x1={0}
                    y1={layout.baselineY}
                    x2={width}
                    y2={layout.baselineY}
                    className="stroke-gray-200 dark:stroke-gray-700"
                    strokeWidth={1}
                />

                {/* median "typical pace" reference */}
                {layout.medianY !== null && (
                    <>
                        <line
                            x1={0}
                            y1={layout.medianY}
                            x2={width}
                            y2={layout.medianY}
                            className="stroke-gray-300 dark:stroke-gray-600"
                            strokeWidth={1}
                            strokeDasharray="4 3"
                        />
                        <text
                            x={width - 2}
                            y={layout.medianY - 3}
                            textAnchor="end"
                            className="fill-gray-400 dark:fill-gray-500"
                            fontSize={9}
                        >
                            typical pace
                        </text>
                    </>
                )}

                {/* the pacing line — only between adjacent reached questions */}
                {layout.lines.map((l, i) => (
                    <line
                        key={`seg-${i}`}
                        x1={l.x1}
                        y1={l.y1}
                        x2={l.x2}
                        y2={l.y2}
                        className="stroke-emerald-500"
                        strokeWidth={2}
                        strokeLinecap="round"
                    />
                ))}

                {/* nodes: filled dot for reached, hollow marker for not */}
                {layout.nodes.map((node) =>
                    node.reached ? (
                        <g key={`node-${node.position}`}>
                            <circle
                                cx={node.x}
                                cy={node.y as number}
                                r={3.5}
                                className="fill-emerald-500"
                            />
                            {(node.viewCount ?? 0) > 1 && (
                                <text
                                    x={node.x}
                                    y={(node.y as number) - 7}
                                    textAnchor="middle"
                                    className="fill-gray-500 dark:fill-gray-400"
                                    fontSize={8}
                                >
                                    ×{node.viewCount}
                                </text>
                            )}
                        </g>
                    ) : (
                        // Never reached: hollow marker at the baseline, curve
                        // broken (no segment touches it). Visibly not a data
                        // point sitting at 0s.
                        <circle
                            key={`node-${node.position}`}
                            cx={node.x}
                            cy={node.baselineY}
                            r={3}
                            className="fill-none stroke-gray-300 dark:stroke-gray-600"
                            strokeWidth={1.5}
                        />
                    )
                )}

                {/* x-axis endpoints: start and end of the paper */}
                <text
                    x={layout.nodes[0]?.x ?? 0}
                    y={height - 8}
                    textAnchor="middle"
                    className="fill-gray-400 dark:fill-gray-500"
                    fontSize={9}
                >
                    Q1
                </text>
                {layout.nodes.length > 1 && (
                    <text
                        x={layout.nodes[layout.nodes.length - 1].x}
                        y={height - 8}
                        textAnchor="middle"
                        className="fill-gray-400 dark:fill-gray-500"
                        fontSize={9}
                    >
                        Q{layout.nodes.length}
                    </text>
                )}
            </svg>

            {/* Accessible equivalent — the SVG carries no data to AT. */}
            <table className="sr-only">
                <caption>Time per question across the paper</caption>
                <thead>
                    <tr>
                        <th scope="col">Question</th>
                        <th scope="col">Time</th>
                        <th scope="col">Visits</th>
                    </tr>
                </thead>
                <tbody>
                    {series.map((p) => (
                        <tr key={p.position}>
                            <th scope="row">Question {p.position}</th>
                            <td>{p.time === null ? 'Not reached' : formatDuration(p.time)}</td>
                            <td>{p.viewCount === null ? '—' : p.viewCount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </figure>
    )
}
