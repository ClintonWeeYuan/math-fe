import type { SkillScore } from '@/client'
import { radarLayout } from '@/lib/skillsRadarGeometry.ts'
import { skillPercent } from '@/lib/diagnosticReport.ts'

type Props = {
    skills: SkillScore[]
    size?: number
}

/**
 * The Skills Radar (§6). A heptagon of the seven core skills, each axis
 * carrying a dot at its score — except a *not-assessed* axis (null score),
 * which gets no dot and a muted, dashed spoke, and the connecting outline
 * breaks around it (see radarSegments) so no edge implies a value where
 * there's no data. Assessed-but-zero still plots a real dot at the centre,
 * keeping the null-vs-zero distinction in the geometry, not just the label.
 *
 * The SVG is decorative (aria-hidden); the data reaches assistive tech
 * through the visually-hidden <table>, a real semantic element so
 * "present" and "usable" can't drift apart.
 */
export function SkillsRadar({ skills, size = 300 }: Props) {
    const { center, axes, rings, segments } = radarLayout(skills, { size, padding: 36 })

    const dotByIndex = (i: number) => axes[i].dot

    // Extra horizontal room in the viewBox so the left/right axis labels
    // (which extend outward from their spoke tips) aren't clipped, without
    // shrinking the radar itself.
    const marginX = 52

    return (
        <figure className="m-0 flex flex-col items-center">
            <svg
                aria-hidden="true"
                viewBox={`${-marginX} 0 ${size + marginX * 2} ${size}`}
                className="w-full max-w-[22rem]"
            >
                {/* grid rings */}
                {rings.map((points, i) => (
                    <polygon
                        key={`ring-${i}`}
                        points={points}
                        className="fill-none stroke-gray-200 dark:stroke-gray-700"
                        strokeWidth={1}
                    />
                ))}

                {/* spokes — dashed + muted for not-assessed axes */}
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

                {/* connecting outline — only between adjacent assessed axes */}
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

                {/* data dots — assessed axes only */}
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

                {/* axis labels: the per-subject skill name (falling back to
                    the bare code when this subject has none) + percent, or a
                    muted "n/a" */}
                {axes.map((axis, i) => {
                    const percent = skillPercent(skills[i].score)
                    const name = skills[i].label ?? axis.skill
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
                            <tspan fontWeight={600}>{name}</tspan>
                            <tspan dx={4} fontSize={10}>
                                {percent === null ? 'n/a' : `${percent}%`}
                            </tspan>
                        </text>
                    )
                })}
            </svg>

            {/* Accessible equivalent — the SVG carries no data to AT. */}
            <table className="sr-only">
                <caption>Skills radar — score per core skill</caption>
                <thead>
                    <tr>
                        <th scope="col">Skill</th>
                        <th scope="col">Score</th>
                    </tr>
                </thead>
                <tbody>
                    {skills.map((s) => {
                        const percent = skillPercent(s.score)
                        return (
                            <tr key={s.skill}>
                                <th scope="row">{s.label ?? s.skill}</th>
                                <td>{percent === null ? 'Not assessed' : `${percent}%`}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </figure>
    )
}
