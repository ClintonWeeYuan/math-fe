import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { SkillsRadar } from '@/components/diagnostic/report/SkillsRadar.tsx'
import { SkillsRadarPaywall } from '@/components/diagnostic/report/SkillsRadarPaywall.tsx'
import { MiniRadarLocked } from '@/components/diagnostic/report/MiniRadarLocked.tsx'
import { PacingCurve } from '@/components/diagnostic/report/PacingCurve.tsx'
import { questionLabelByIdFrom } from '@/lib/diagnosticReport.ts'
import {
    buildReportInsights,
    type SkillInsight,
} from '@/lib/diagnosticReportInsights.ts'
import { skillAdvice } from '@/lib/diagnosticSkillAdvice.ts'
import type { DiagnosticReportResponse } from '@/client'
import type { SeasonOffer } from '@/lib/billingApi.ts'

type Props = {
    report: DiagnosticReportResponse
    /** The set's total question count (for the completion line + pacing
     * zero-fill); optional so a caller without the preview still renders. */
    questionCount?: number
    title?: string
    /** Optional line under the title — e.g. which student's report this is. */
    subtitle?: ReactNode
    /** Opens checkout from the paywall. Omitted (e.g. on the admin view)
     * leaves the unlock CTA out. */
    onUnlock?: (seasonKey: string) => void
    /** The seasons on sale, for the paywall's buy buttons. */
    seasons?: SeasonOffer[]
    /** Rendered at the bottom (a back button). */
    footer?: ReactNode
}

/**
 * The self-interpreting report, as pure presentation over an already-fetched
 * report. Shared by the student's own report page and the admin any-student
 * view, so both render identically — the second-person copy is deliberate:
 * the admin sees exactly what the student sees.
 */
export function DiagnosticReportView({
    report,
    questionCount,
    title = 'Your diagnostic report',
    subtitle,
    footer,
    onUnlock,
    seasons,
}: Props) {
    // Default true: an admin read, or any response without the field, must
    // never be paywalled by accident.
    const hasPass = report.hasPass ?? true
    // A mini's radar is absent, not withheld — no amount of paying produces
    // one for ten questions. Keyed off the format rather than off an empty
    // skillsRadar, because a free student's full-paper report is also empty
    // and those two must not render the same thing. `format` is not in the
    // generated client yet (regenerating rewrites all ~1500 lines of it), so
    // it is read through a narrowing here; absent, this reads 'full', which
    // is the pre-mini behaviour.
    const isMini = (report as { format?: 'mini' | 'full' }).format === 'mini'
    const totalScore = report.attempt.totalScore ?? 0
    const { answeredCount, subject } = report
    const labelById = questionLabelByIdFrom(report.perQuestionTime)
    const insights = buildReportInsights(
        report.skillsRadar,
        subject,
        totalScore,
        answeredCount
    )

    return (
        <div className="mx-auto mt-12 flex max-w-2xl flex-col gap-6 px-4">
            <div>
                <h1 className="text-3xl font-semibold">{title}</h1>
                {subtitle && (
                    <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                )}
            </div>

            {/* Accuracy over *attempted*, kept separate from completion. */}
            <Card>
                <CardContent className="flex flex-col gap-1 pt-6">
                    <span className="text-3xl font-semibold">
                        {answeredCount === 0
                            ? 'No questions answered'
                            : `${totalScore}/${answeredCount} correct`}
                    </span>
                    <span className="text-sm text-gray-500">
                        {answeredCount > 0 && 'of questions attempted · '}
                        {questionCount !== undefined
                            ? `${answeredCount}/${questionCount} attempted`
                            : `${answeredCount} attempted`}
                    </span>
                </CardContent>
            </Card>

            {/* Written strengths & focus areas — the plain-English layer.
                Derived from skillsRadar, which the free tier does not
                receive, so it is withheld with the radar rather than
                rendering its empty state as a genuine verdict. Excluded on a
                mini for the same reason from the other direction: the radar
                is empty there for everyone, so "no standout strengths" would
                be a verdict drawn from nothing. */}
            {hasPass && !isMini && (
                <section className="flex flex-col gap-3">
                    <h2 className="text-xl font-medium">Where you stand</h2>
                    <Card>
                        <CardContent className="flex flex-col gap-4 pt-6">
                            <p className="text-gray-700">{insights.headline}</p>

                            <div>
                                <h3 className="mb-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                    Where you&apos;re strong
                                </h3>
                                {insights.strengths.length === 0 ? (
                                    <p className="text-sm text-gray-600">
                                        No standout strengths this time — but
                                        that just means there&apos;s lots of
                                        room to grow. Start with the focus areas
                                        below.
                                    </p>
                                ) : (
                                    <ul className="flex flex-col gap-1">
                                        {insights.strengths.map((s) => (
                                            <SkillLine
                                                key={s.code}
                                                insight={s}
                                                tone="strength"
                                            />
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {insights.focusAreas.length > 0 && (
                                <div>
                                    <h3 className="mb-1 text-sm font-semibold text-amber-700 dark:text-amber-400">
                                        Where to focus next
                                    </h3>
                                    <ul className="flex flex-col gap-1">
                                        {insights.focusAreas.map((s) => (
                                            <SkillLine
                                                key={s.code}
                                                insight={s}
                                                tone="focus"
                                            />
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>
            )}

            {/* Skills Radar — the set's real axes; full names in the legend.
                Three states, and the third is the one worth being careful
                about. With a pass: the radar. Without: the paywall, because
                the scores never reach the browser. On a mini: neither — the
                radar is absent rather than withheld, and showing the paywall
                would sell something no payment can deliver. */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl font-medium">Your skills at a glance</h2>
                <Card>
                    <CardContent className="pt-6">
                        {isMini ? (
                            <MiniRadarLocked subject={subject} />
                        ) : hasPass ? (
                            <SkillsRadar
                                skills={report.skillsRadar}
                                subject={subject}
                            />
                        ) : (
                            <SkillsRadarPaywall
                                subject={subject}
                                onUnlock={onUnlock}
                                seasons={seasons}
                            />
                        )}
                    </CardContent>
                </Card>
            </section>

            {/* Concrete next steps for each focus area — radar-derived, so
                pass holders only, and never on a mini (whose radar is empty
                by design, making every "focus area" an artefact of one or two
                questions). */}
            {hasPass && !isMini && insights.focusAreas.length > 0 && (
                <section className="flex flex-col gap-3">
                    <h2 className="text-xl font-medium">Your next steps</h2>
                    <Card>
                        <CardContent className="flex flex-col gap-4 pt-6">
                            {insights.focusAreas.map((s) => (
                                <div key={s.code}>
                                    <p className="text-sm font-medium">
                                        {s.name}
                                        {s.name !== s.code && (
                                            <span className="text-gray-400">
                                                {' '}
                                                ({s.code})
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {skillAdvice(subject, s.code)}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>
            )}

            {/* Flagged and never revisited — clearly labelled. */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl font-medium">
                    Questions you flagged to revisit
                </h2>
                <Card>
                    <CardContent className="pt-6">
                        {report.flaggedNeverRevisited.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                You went back to every question you flagged —
                                nice.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <p className="text-sm text-gray-600">
                                    You flagged these during the exam but
                                    didn&apos;t come back to them — worth a
                                    second look.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {report.flaggedNeverRevisited.map((id) => (
                                        <Badge key={id} variant="secondary">
                                            {labelById.get(id) ?? 'Question'}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>

            {/* Pacing — time per question, with a caption explaining it. */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl font-medium">Time per question</h2>
                <Card>
                    <CardContent className="flex flex-col gap-3 pt-6">
                        <p className="text-sm text-gray-600">
                            How long you spent on each question, in order.
                            Taller bars are where you slowed down, and the
                            dashed line is your typical pace — useful for
                            spotting which topics cost you time.
                        </p>
                        <PacingCurve
                            perQuestionTime={report.perQuestionTime}
                            questionCount={questionCount}
                        />
                    </CardContent>
                </Card>
            </section>

            {footer && <div>{footer}</div>}
        </div>
    )
}

/** One strength/focus line: full name, code, percentage, and — for focus areas
 * — the denominator plus a "limited data" note when the sample is small. */
function SkillLine({
    insight,
    tone,
}: {
    insight: SkillInsight
    tone: 'strength' | 'focus'
}) {
    return (
        <li className="text-sm text-gray-700">
            <span className="font-medium">{insight.name}</span>
            {insight.name !== insight.code && (
                <span className="text-gray-400"> ({insight.code})</span>
            )}{' '}
            — {insight.pct}%
            {tone === 'focus' && (
                <span className="text-gray-500">
                    {' '}
                    ({insight.correct} of {insight.attempted}
                    {insight.limitedData ? ', limited data' : ''})
                </span>
            )}
        </li>
    )
}
