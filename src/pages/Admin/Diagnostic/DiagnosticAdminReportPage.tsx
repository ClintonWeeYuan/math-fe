import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import { LoadingPage } from '@/components/common/FullLoadingPage.tsx'
import { Button } from '@/components/ui/button.tsx'
import useAdminAttemptReportQuery from '@/hooks/diagnostic/useAdminAttemptReportQuery.ts'
import useGetSetPreviewQuery from '@/hooks/diagnostic/useGetSetPreviewQuery.ts'
import { AttemptReportError } from '@/hooks/diagnostic/useGetAttemptReportQuery.ts'
import { DiagnosticReportView } from '@/components/diagnostic/report/DiagnosticReportView.tsx'

/**
 * A tutor's view of any student's full report, reached from the Results table.
 * Uses the admin (non-owner-scoped) report endpoint and renders the same
 * report view the student sees. The student's email is passed via navigation
 * state from the results row (falls back gracefully on a direct link).
 */
export function DiagnosticAdminReportPage() {
    const { attemptId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const studentEmail = (location.state as { studentEmail?: string } | null)
        ?.studentEmail

    const { data: report, isLoading, error } = useAdminAttemptReportQuery(
        attemptId ?? ''
    )
    const { data: preview } = useGetSetPreviewQuery({
        setId: report?.attempt.diagnosticSetId ?? '',
        enabled: report !== undefined,
    })

    const backToResults = (
        <Button variant="outline" onClick={() => navigate('/admin/results')}>
            Back to results
        </Button>
    )

    let body
    if (isLoading) {
        body = <LoadingPage />
    } else if (error instanceof AttemptReportError && error.status === 409) {
        body = (
            <div className="mx-auto mt-16 flex max-w-md flex-col items-center gap-4 text-center">
                <h1 className="text-2xl font-semibold">Attempt still in progress</h1>
                <p className="text-gray-600">
                    This attempt hasn&apos;t been submitted yet, so there&apos;s no
                    report to show.
                </p>
                {backToResults}
            </div>
        )
    } else if (error || !report) {
        body = (
            <div className="mx-auto mt-16 flex max-w-md flex-col items-center gap-4 text-center">
                <h1 className="text-2xl font-semibold">Report not available</h1>
                <p className="text-gray-600">
                    This report couldn&apos;t be loaded. The attempt may not exist.
                </p>
                {backToResults}
            </div>
        )
    } else {
        body = (
            <DiagnosticReportView
                report={report}
                questionCount={preview?.questionCount}
                title="Student report"
                subtitle={[studentEmail, report.subject].filter(Boolean).join(' · ')}
                footer={backToResults}
            />
        )
    }

    return <AdminLayout>{body}</AdminLayout>
}
