import { useNavigate, useParams } from 'react-router-dom'
import { LoadingPage } from '@/components/common/FullLoadingPage.tsx'
import { Button } from '@/components/ui/button.tsx'
import useGetAttemptReportQuery, {
    AttemptReportError,
} from '@/hooks/diagnostic/useGetAttemptReportQuery.ts'
import useGetSetPreviewQuery from '@/hooks/diagnostic/useGetSetPreviewQuery.ts'
import { DiagnosticReportView } from '@/components/diagnostic/report/DiagnosticReportView.tsx'
import { WhatNext } from '@/components/diagnostic/report/WhatNext.tsx'

/**
 * The student's own post-exam report (§6). Fetches the owner-scoped report and
 * renders the shared report view. Reached from the terminal exam view's "view
 * your report" CTA (or directly, if the student owns the attempt).
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

    // Same narrowing the report view uses: `format` is not in the generated
    // client yet, and absent it reads as a full paper.
    const isMini = (report as { format?: 'mini' | 'full' }).format === 'mini'

    return (
        <DiagnosticReportView
            report={report}
            questionCount={preview?.questionCount}
            footer={
                // Passed as the footer rather than built into the report view,
                // because the admin page renders that same view and has no use
                // for "start a diagnostic" buttons on someone else's results.
                <div className="flex flex-col gap-8">
                    <WhatNext
                        subject={report.subject}
                        currentSetId={report.attempt.diagnosticSetId}
                        isMini={isMini}
                    />
                    <div>
                        <Button variant="outline" onClick={() => navigate('/')}>
                            Back to home
                        </Button>
                    </div>
                </div>
            }
        />
    )
}
