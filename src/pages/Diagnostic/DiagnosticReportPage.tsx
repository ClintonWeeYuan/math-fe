import { useNavigate, useParams } from 'react-router-dom'
import { LoadingPage } from '@/components/common/FullLoadingPage.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import useGetAttemptReportQuery, {
    AttemptReportError,
} from '@/hooks/diagnostic/useGetAttemptReportQuery.ts'
import useGetSetPreviewQuery from '@/hooks/diagnostic/useGetSetPreviewQuery.ts'
import { questionLabelByIdFrom } from '@/lib/diagnosticReport.ts'
import { SkillsRadar } from '@/components/diagnostic/report/SkillsRadar.tsx'
import { PacingCurve } from '@/components/diagnostic/report/PacingCurve.tsx'
import {
    buildReportInsights,
    type SkillInsight,
} from '@/lib/diagnosticReportInsights.ts'
import { skillAdvice } from '@/lib/diagnosticSkillAdvice.ts'

/**
 * Post-exam report screen (§6). Reads the report endpoint and turns it into a
 * self-interpreting screen for a student: the accuracy headline, a written
 * strengths/focus-areas summary (decoding S1–S7 into full subject names),
 * the Skills Radar with a full-name legend, concrete next steps per focus
 * area, the flagged-questions call-out, and the pacing curve. "Not measured"
 * (n/a) is kept distinct from a real 0% throughout.
 */
export function DiagnosticReportPage() {
    const { attemptId } = useParams()
    const navigate = useNavigate()

    const {
        data: report,
        isLoading,
        error,
    } = useGetAttemptReportQuery({ attemptId: attemptId ?? '' })

    const { data: preview } = useGetSetPreviewQuery({
        setId: report?.attempt.diagnosticSetId ?? '',
        enabled: report !== undefined,
    })

    if (isLoading) return <LoadingPage />

    if (error instanceof AttemptReportError && error.status === 409) {
        return (
            <div className="mx-auto mt-16 flex max-w-md flex-col items-center gap-4 text-center">
                <h1 className="text-2xl font-semibold">Your exam isn&apos;t finished</h1>
                <p className="text-gray-600">
                    This diagnostic is still in progress, so there&apos;s no report
                    yet. Head back to finish it.
                </p>
                <Button onClick={() => navigate(`/diagnostic/attempts/${attemptId}`)}>
                    Resume exam
                </Button>
            </div>
        )
    }

    if (error || !report) {
        return (
            <div className="mx-auto mt-16 flex max-w-md flex-col items-center gap-4 text-center">
                <h1 className="text-2xl font-semibold">Report not available</h1>
                <p className="text-gray-600">
                    This report couldn&apos;t be loaded. It may not exist or may not
                    be yours.
                </p>
                <Button variant="outline" onClick={() => navigate('/')}>
                    Back to home
                </Button>
            </div>
        )
    }

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
            <h1 className="text-3xl font-semibold">Your diagnostic report</h1>

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
                        {preview
                            ? `${answeredCount}/${preview.questionCount} attempted`
                            : `${answeredCount} attempted`}
                    </span>
                </CardContent>
            </Card>

            {/* Written strengths & focus areas — the plain-English layer. */}
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
                                    No standout strengths this time — but that just
                                    means there&apos;s lots of room to grow. Start
                                    with the focus areas below.
                                </p>
                            ) : (
                                <ul className="flex flex-col gap-1">
                                    {insights.strengths.map((s) => (
                                        <SkillLine key={s.code} insight={s} tone="strength" />
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
                                        <SkillLine key={s.code} insight={s} tone="focus" />
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>

            {/* Skills Radar — the set's real axes; full names in the legend. */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl font-medium">Your skills at a glance</h2>
                <Card>
                    <CardContent className="pt-6">
                        <SkillsRadar skills={report.skillsRadar} subject={subject} />
                    </CardContent>
                </Card>
            </section>

            {/* Concrete next steps for each focus area. */}
            {insights.focusAreas.length > 0 && (
                <section className="flex flex-col gap-3">
                    <h2 className="text-xl font-medium">Your next steps</h2>
                    <Card>
                        <CardContent className="flex flex-col gap-4 pt-6">
                            {insights.focusAreas.map((s) => (
                                <div key={s.code}>
                                    <p className="text-sm font-medium">
                                        {s.name}
                                        {s.name !== s.code && (
                                            <span className="text-gray-400"> ({s.code})</span>
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

            {/* Flagged and never revisited — now clearly labelled. */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl font-medium">Questions you flagged to revisit</h2>
                <Card>
                    <CardContent className="pt-6">
                        {report.flaggedNeverRevisited.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                You went back to every question you flagged — nice.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <p className="text-sm text-gray-600">
                                    You flagged these during the exam but didn&apos;t
                                    come back to them — worth a second look.
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
                            How long you spent on each question, in order. Tall bars
                            are where you slowed down — useful for spotting which
                            topics cost you time.
                        </p>
                        <PacingCurve
                            perQuestionTime={report.perQuestionTime}
                            questionCount={preview?.questionCount}
                        />
                    </CardContent>
                </Card>
            </section>

            <div>
                <Button variant="outline" onClick={() => navigate('/')}>
                    Back to home
                </Button>
            </div>
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
