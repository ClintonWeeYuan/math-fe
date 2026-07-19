import type { SkillScore } from '@/client'
import { radarLayout } from '@/lib/skillsRadarGeometry.ts'
import { skillPercent } from '@/lib/diagnosticReport.ts'
import { skillName } from '@/lib/diagnosticSkillFrameworks.ts'

type Props = {
    skills: SkillScore[]
    /** The set's subject, used to decode S1–S7 into full names in the legend. */
    subject?: string | null
    size?: number
}

/**
 * The Skills Radar (§6). A polygon over the skills this set assesses, each axis
 * carrying a dot at its score — except a *not-measured* axis (null score),
 * which gets no dot and a muted, dashed spoke, and the connecting outline
 * breaks around it so no edge implies a value where there's no data.
 * Assessed-but-zero still plots a real dot at the centre, keeping the
 * not-measured-vs-0% distinction in the geometry, not just the label.
 *
 * The SVG (decorative, aria-hidden) keeps compact codes; the legend beneath it
 * is the real semantic table — full subject names, the percentage with its
 * denominator, and an explicit "not assessed in this set" for null axes.
 */
export function SkillsRadar({ skills, subject, size = 300 }: Props) {
    const { center, axes, rings, segments } = radarLayout(skills, { size, padding: 36 })

    const dotByIndex = (i: number) => axes[i].dot
    const marginX = 52

    return (
        <figure className="m-0 flex flex-col items-center gap-4">
            <svg
                aria-hidden="true"
                viewBox={`${-marginX} 0 ${size + marginX * 2} ${size}`}
                className="w-full max-w-[22rem]"
            >
                {rings.map((points, i) => (
                    <polygon
                        key={`ring-${i}`}
                        points={points}
                        className="fill-none stroke-gray-200 dark:stroke-gray-700"
                        strokeWidth={1}
                    />
                ))}

                {axes.map((axis) => (
                    <line
                        key={`spoke-${axis.skill}`}
                        x1={center.x}
                        y1={center.y}
                        x2={axis.axisEnd.x}
                        y2={axis.axisEnd.y}
                        className={
                            axis.assessed
                                ? 'stroke-gray-200 dark:stroke-gray-700'
                                : 'stroke-gray-300 dark:stroke-gray-600'
                        }
                        strokeWidth={1}
                        strokeDasharray={axis.assessed ? undefined : '3 3'}
                    />
                ))}

                {segments.map(([i, j]) => {
                    const a = dotByIndex(i)
                    const b = dotByIndex(j)
                    if (!a || !b) return null
                    return (
                        <line
                            key={`seg-${i}-${j}`}
                            x1={a.x}
                            y1={a.y}
                            x2={b.x}
                            y2={b.y}
                            className="stroke-emerald-500"
                            strokeWidth={2}
                            strokeLinecap="round"
                        />
                    )
                })}

                {axes.map((axis) =>
                    axis.dot ? (
                        <circle
                            key={`dot-${axis.skill}`}
                            cx={axis.dot.x}
                            cy={axis.dot.y}
                            r={4}
                            className="fill-emerald-500"
                        />
                    ) : null
                )}

                {/* axis labels stay compact — full names live in the legend */}
                {axes.map((axis, i) => {
                    const percent = skillPercent(skills[i].score)
                    return (
                        <text
                            key={`label-${axis.skill}`}
                            x={axis.label.x}
                            y={axis.label.y}
                            textAnchor={axis.labelAnchor}
                            dominantBaseline="middle"
                            className={
                                axis.assessed
                                    ? 'fill-gray-700 dark:fill-gray-200'
                                    : 'fill-gray-400 dark:fill-gray-500'
                            }
                            fontSize={11}
                        >
                            <tspan fontWeight={600}>{axis.skill}</tspan>
                            <tspan dx={4} fontSize={10}>
                                {percent === null ? 'n/a' : `${percent}%`}
                            </tspan>
                        </text>
                    )
                })}
            </svg>

            {/* Legend — the semantic, sighted-and-AT-shared representation:
                full name per code, percentage with denominator, and an explicit
                not-measured note kept distinct from a real 0%. */}
            <table className="w-full text-sm">
                <caption className="sr-only">
                    Skills radar — score per core skill
                </caption>
                <tbody>
                    {skills.map((s) => {
                        const percent = skillPercent(s.score)
                        const notMeasured = percent === null
                        return (
                            <tr key={s.skill} className="border-t border-gray-100 dark:border-gray-800">
                                <th scope="row" className="py-1.5 pr-3 text-left font-normal">
                                    {skillName(subject, s.skill)}
                                    {skillName(subject, s.skill) !== s.skill && (
                                        <span className="text-gray-400"> ({s.skill})</span>
                                    )}
                                </th>
                                <td className="py-1.5 text-right whitespace-nowrap">
                                    {notMeasured ? (
                                        <span className="text-gray-400 dark:text-gray-500">
                                            not assessed in this set
                                        </span>
                                    ) : (
                                        <>
                                            <span className="font-medium">{percent}%</span>{' '}
                                            <span className="text-gray-400">
                                                ({s.correct ?? 0}/{s.attempted ?? 0})
                                            </span>
                                        </>
                                    )}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </figure>
    )
}
