import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LoadingPage } from '@/components/common/FullLoadingPage.tsx'
import { Button } from '@/components/ui/button.tsx'
import useGetAttemptReportQuery, {
    AttemptReportError,
} from '@/hooks/diagnostic/useGetAttemptReportQuery.ts'
import useGetSetPreviewQuery from '@/hooks/diagnostic/useGetSetPreviewQuery.ts'
import { DiagnosticReportView } from '@/components/diagnostic/report/DiagnosticReportView.tsx'
import { WhatNext } from '@/components/diagnostic/report/WhatNext.tsx'
import { ReviewAnswers } from '@/components/diagnostic/report/ReviewAnswers.tsx'
import { trackEvent } from '@/lib/analytics.ts'
import useStartCheckoutMutation from '@/hooks/billing/useStartCheckoutMutation.ts'
import { BILLING_LIVE } from '@/lib/billing.ts'
import useBillingStatusQuery from '@/hooks/billing/useBillingStatusQuery.ts'
import useListPublishedSetsQuery from '@/hooks/diagnostic/useListPublishedSetsQuery.ts'
import { testFromSubject } from '@/lib/diagnosticNextSteps.ts'
import { useCheckoutCancelledNotice } from '@/lib/checkoutIntent.ts'

/**
 * The student's own post-exam report (§6). Fetches the owner-scoped report and
 * renders the shared report view. Reached from the terminal exam view's "view
 * your report" CTA (or directly, if the student owns the attempt).
 */
export function DiagnosticReportPage() {
    const { attemptId } = useParams()
    const navigate = useNavigate()
    const { mutate: startCheckout } = useStartCheckoutMutation()
    // Only reached on a report, which is behind auth already. Its job here is
    // the end date for the paywall's fine print, and whether the season is
    // still on sale at all.
    // Always signed in on a report — the route is behind the student guard.
    const { data: billing } = useBillingStatusQuery({
        enabled: BILLING_LIVE,
        signedIn: true,
    })
    // What there is to sell right now. Empty before billing ships and after
    // both windows have passed, and the paywall renders no CTA either way.
    const seasons = BILLING_LIVE ? (billing?.seasons ?? []) : []

    const {
        data: report,
        isLoading,
        error,
    } = useGetAttemptReportQuery({ attemptId: attemptId ?? '' })

    const { data: preview } = useGetSetPreviewQuery({
        setId: report?.attempt.diagnosticSetId ?? '',
        enabled: report !== undefined,
    })

    // Once the report is actually in hand, not on mount: mounting happens
    // while it is still loading, and an attempt that 409s or 403s was never
    // viewed. Keyed on attemptId so a student moving between two reports
    // records both.
    useEffect(() => {
        if (report !== undefined && attemptId) {
            trackEvent('report_viewed', { attemptId })
        }
    }, [report, attemptId])

    useCheckoutCancelledNotice('report')

    // The paywall is on screen: a full paper, no pass, and something on sale.
    // The funnel's first number for the pass — a click rate needs it.
    const reportTest = testFromSubject(report?.subject)
    const paywallSeason = seasons.find((s) => s.test === reportTest)?.key
    const showsPaywall =
        report !== undefined &&
        report.hasPass === false &&
        (report as { format?: 'mini' | 'full' }).format !== 'mini'
    useEffect(() => {
        if (showsPaywall && attemptId) {
            trackEvent('paywall_shown', {
                attemptId,
                metadata: { source: 'report', season: paywallSeason ?? null },
            })
        }
    }, [showsPaywall, attemptId, paywallSeason])

    // How many papers the pass would open, for the paywall's list. Only
    // fetched when there is a paywall to put it on.
    const { data: testSets } = useListPublishedSetsQuery(
        showsPaywall ? reportTest : undefined
    )
    const paidPaperCount = showsPaywall
        ? (testSets ?? []).filter(
              (s) =>
                  !s.isFree &&
                  (s as { format?: 'mini' | 'full' }).format !== 'mini'
          ).length || undefined
        : undefined

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
            // Only while there is something to sell: undefined leaves the
            // paywall's buy buttons out entirely, which is the honest
            // rendering both before billing ships and after both windows have
            // passed (when checkout would 409 anyway). The blurred radar and
            // its explanation still show — that part is true either way.
            seasons={seasons}
            paidPaperCount={paidPaperCount}
            onUnlock={
                seasons.length > 0
                    ? (season: string) => {
                          trackEvent('unlock_clicked', {
                              attemptId,
                              metadata: { source: 'report', season },
                          })
                          // Abandoning checkout returns them to this report,
                          // not to the catalogue — they were reading it.
                          startCheckout({
                              season,
                              returnPath: `/diagnostic/attempts/${attemptId}/report`,
                          })
                      }
                    : undefined
            }
            footer={
                // Passed as the footer rather than built into the report view,
                // because the admin page renders that same view and has no use
                // for "start a diagnostic" buttons on someone else's results.
                <div className="flex flex-col gap-8">
                    {/* Before "what next": the paper they just sat is more
                        use to them than the next one. Also in the footer slot,
                        so the admin view of the same report does not gain a
                        student's review. */}
                    <ReviewAnswers attemptId={attemptId ?? ''} />
                    <WhatNext
                        subject={report.subject}
                        currentSetId={report.attempt.diagnosticSetId}
                        isMini={isMini}
                    />
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/my-results')}
                        >
                            View all my results
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/')}>
                            Back to home
                        </Button>
                    </div>
                </div>
            }
        />
    )
}
