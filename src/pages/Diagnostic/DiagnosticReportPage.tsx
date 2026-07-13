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

/**
 * Post-exam report screen (§6). Its own route/query, reached from the
 * terminal exam view's "View your report" CTA (or directly, later). Turns
 * the report endpoint's three deliverables into a screen: the accuracy-
 * over-attempted headline, the Skills Radar (all seven skills; "not
 * assessed" is distinct from a low score), the flagged-and-never-revisited
 * call-out, and the per-question pacing list.
 *
 * PR 1 renders these plainly (labelled rows/bars); the SVG Skills Radar and
 * pacing curve are PR 2, layered over this same already-flowing data.
 */
export function DiagnosticReportPage() {
    const { attemptId } = useParams()
    const navigate = useNavigate()

    const {
        data: report,
        isLoading,
        error,
    } = useGetAttemptReportQuery({ attemptId: attemptId ?? '' })

    // Completion denominator: the set's full question count. Sourced from
    // the existing preview query rather than duplicated into the report —
    // enabled only once we know the set from the report.
    const { data: preview } = useGetSetPreviewQuery({
        setId: report?.attempt.diagnosticSetId ?? '',
        enabled: report !== undefined,
    })

    if (isLoading) return <LoadingPage />

    // Still in progress: the endpoint 409s. Offer to resume, not an error.
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
    const { answeredCount } = report
    const labelById = questionLabelByIdFrom(report.perQuestionTime)

    return (
        <div className="mx-auto mt-12 flex max-w-2xl flex-col gap-6 px-4">
            <h1 className="text-3xl font-semibold">Your diagnostic report</h1>

            {/* Accuracy over *attempted*, kept separate from completion — an
                unanswered question is never counted as wrong. */}
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

            {/* Skills Radar — all seven skills; null = not assessed. */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl font-medium">Skills</h2>
                <Card>
                    <CardContent className="pt-6">
                        <SkillsRadar skills={report.skillsRadar} />
                    </CardContent>
                </Card>
            </section>

            {/* Flagged and never revisited — a concrete pacing failure mode. */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl font-medium">Flagged &amp; never revisited</h2>
                <Card>
                    <CardContent className="pt-6">
                        {report.flaggedNeverRevisited.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                You went back to every question you flagged — nice.
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {report.flaggedNeverRevisited.map((id) => (
                                    <Badge key={id} variant="secondary">
                                        {labelById.get(id) ?? 'Question'}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>

            {/* Pacing — time per question across the paper sequence. */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl font-medium">Time per question</h2>
                <Card>
                    <CardContent className="pt-6">
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
