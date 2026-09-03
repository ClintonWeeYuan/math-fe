import type { PerQuestionTime } from '@/client'
import { buildPacingSeries, pacingLayout } from '@/lib/pacingCurve.ts'
import { formatDuration } from '@/lib/diagnosticReport.ts'

type Props = {
    perQuestionTime: PerQuestionTime[]
    /** The set's full size, for the whole-paper x-axis. Absent while the
     * set preview is still loading — the chart degrades to the questions it
     * has rather than blocking. */
    questionCount?: number
    width?: number
    height?: number
}

/**
 * Time per question (§6): engaged seconds across the paper sequence.
 *
 * Bars, not a line. This was a line, on the reasoning that slope makes
 * "rushed the back third" legible — but twenty-seven questions are
 * independent measurements, and a segment drawn from Q13 to Q14 asserts an
 * interpolation between them that does not exist. A student does not pass
 * *through* intermediate durations on the way from one question to the next.
 * Bars also match what the caption has always promised.
 *
 * The change that mattered most was not the marks, though: the chart had no
 * scale. A tall mark could be ninety seconds or nine minutes and nothing on
 * screen said which, so the shape was decorative. Two direct labels fix that
 * — the median line carries its own value, and the slowest question is named
 * and timed, which is the question a student actually brings here ("what cost
 * me the time?"). Everything else can be read off those two anchors.
 *
 * Three distinct states, three treatments that can't blur:
 *  - time = bar height (lingered = tall, brief = short);
 *  - viewCount = a discrete "×N" revisit tag above the bar, never mixed into
 *    height, so thrice-briefly can't look like once-at-length;
 *  - never-reached = a hollow stub on the baseline, NOT a zero-height bar
 *    (which would read as answered instantly rather than never seen).
 *
 * SVG decorative (aria-hidden); data reaches AT via the visually-hidden
 * <table>. Per-bar <title> gives sighted mouse users the exact value, since
 * a bar chart with no tooltip makes the reader estimate what we already know.
 */
export function PacingCurve({
    perQuestionTime,
    questionCount,
    width = 320,
    height = 180,
}: Props) {
    const series = buildPacingSeries(perQuestionTime, questionCount)
    const layout = pacingLayout(series, { width, height })
    const slowest =
        layout.slowestIndex !== null ? layout.bars[layout.slowestIndex] : null

    return (
        <figure className="m-0 flex flex-col gap-2">
            <svg
                aria-hidden="true"
                viewBox={`0 0 ${width} ${height}`}
                className="w-full"
            >
                {/* median "typical pace" reference, drawn under the bars so a
                    tall bar reads as crossing it rather than being cut by it */}
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
                        {/* Left-anchored and above the line. It used to sit on
                            the right, where the data ran through it. */}
                        <text
                            x={0}
                            y={layout.medianY - 4}
                            className="fill-gray-500 dark:fill-gray-400 stroke-white dark:stroke-gray-900"
                            strokeWidth={3}
                            paintOrder="stroke"
                            fontSize={9}
                        >
                            typical {formatDuration(layout.medianValue ?? 0)}
                        </text>
                    </>
                )}

                {layout.bars.map((bar) =>
                    bar.reached ? (
                        <g key={`bar-${bar.position}`}>
                            <rect
                                x={bar.x}
                                y={bar.y}
                                width={bar.width}
                                height={bar.height}
                                rx={Math.min(2, bar.width / 2)}
                                className={
                                    bar.isSlowest
                                        ? 'fill-emerald-600 dark:fill-emerald-400'
                                        : 'fill-emerald-500/70 dark:fill-emerald-500/60'
                                }
                            >
                                <title>
                                    {`Q${bar.position} · ${formatDuration(bar.time ?? 0)}`}
                                    {(bar.viewCount ?? 0) > 1
                                        ? ` · ${bar.viewCount} visits`
                                        : ''}
                                </title>
                            </rect>
                            {(bar.viewCount ?? 0) > 1 && (
                                <text
                                    x={bar.x + bar.width / 2}
                                    y={bar.y - 3}
                                    textAnchor="middle"
                                    className="fill-gray-500 dark:fill-gray-400"
                                    fontSize={8}
                                >
                                    ×{bar.viewCount}
                                </text>
                            )}
                        </g>
                    ) : (
                        // Never reached: a hollow stub on the baseline. Not a
                        // zero-height bar, which would read as "answered
                        // instantly" rather than "never seen".
                        <rect
                            key={`bar-${bar.position}`}
                            x={bar.x}
                            y={layout.baselineY - 2}
                            width={bar.width}
                            height={2}
                            className="fill-gray-200 dark:fill-gray-700"
                        >
                            <title>{`Q${bar.position} · not reached`}</title>
                        </rect>
                    )
                )}

                {/* The answer to "what cost me the time?", said rather than
                    left to be estimated off an unlabelled shape. */}
                {slowest !== null && (
                    <text
                        x={Math.min(
                            Math.max(slowest.x + slowest.width / 2, 34),
                            width - 34
                        )}
                        y={Math.max(slowest.y - 6, 9)}
                        textAnchor="middle"
                        className="fill-gray-700 dark:fill-gray-200 stroke-white dark:stroke-gray-900"
                        strokeWidth={3}
                        paintOrder="stroke"
                        fontSize={9}
                        fontWeight={600}
                    >
                        Q{slowest.position} · {formatDuration(slowest.time ?? 0)}
                    </text>
                )}

                {/* baseline, over the bar feet so they sit on a line */}
                <line
                    x1={0}
                    y1={layout.baselineY}
                    x2={width}
                    y2={layout.baselineY}
                    className="stroke-gray-200 dark:stroke-gray-700"
                    strokeWidth={1}
                />

                {/* x-axis endpoints: start and end of the paper */}
                <text
                    x={layout.bars[0]?.x ?? 0}
                    y={height - 8}
                    className="fill-gray-400 dark:fill-gray-500"
                    fontSize={9}
                >
                    Q1
                </text>
                {layout.bars.length > 1 && (
                    <text
                        x={width}
                        y={height - 8}
                        textAnchor="end"
                        className="fill-gray-400 dark:fill-gray-500"
                        fontSize={9}
                    >
                        Q{layout.bars.length}
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
