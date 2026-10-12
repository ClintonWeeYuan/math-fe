import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import { useAuth } from '@/components/auth/AuthContext.tsx'
import useRedemptionQueueQuery from '@/hooks/diagnostic/useRedemptionQueueQuery.ts'
import useBuildRedemptionSetMutation from '@/hooks/diagnostic/useBuildRedemptionSetMutation.ts'
import type { DiagnosticApiError } from '@/lib/diagnosticApiError.ts'
import { trackEvent } from '@/lib/analytics.ts'
import { readyGroups, readySummary } from '@/lib/redemption.ts'

/**
 * "You have 20 questions ready to redeem" — one line wherever a signed-in
 * student already is.
 *
 * Redemption's only door was the My results page, which one student in five
 * has ever opened: in the first weekend 13 students had questions ready, five
 * came back, three sat a fresh paper instead, and none found the round. So
 * the invitation goes on the report they are reading and on the home page
 * they land on, and renders nothing at all when there is nothing ready.
 *
 * One ready paper: the button builds the sitting and goes straight to its
 * start page (or resumes one under way). More than one: it goes to the
 * results section, which lists them.
 */
export function RedemptionReadyBanner({ source }: { source: 'home' | 'report' }) {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { data: groups } = useRedemptionQueueQuery({ enabled: user !== null })
    const { mutate: build, isPending } = useBuildRedemptionSetMutation()

    const ready = readyGroups(groups ?? [])
    if (user === null || ready.length === 0) return null
    const summary = readySummary(ready)

    function go() {
        trackEvent('redemption_banner_clicked', {
            metadata: { source, papers: ready.length, questions: summary.questions },
        })
        if (ready.length > 1) {
            navigate('/my-results#redemption')
            return
        }
        const [group] = ready
        if (group.pendingAttemptId) {
            navigate(`/diagnostic/attempts/${group.pendingAttemptId}`)
        } else if (group.pendingSetId) {
            navigate(`/diagnostic/sets/${group.pendingSetId}`)
        } else {
            build(group.sourceSetId, {
                onSuccess: (built) => navigate(`/diagnostic/sets/${built.setId}`),
                onError: (error) => {
                    const status = (error as DiagnosticApiError).status
                    toast(
                        status === 402
                            ? 'This paper is part of the Season Pass, which has ended for you, so its questions are closed.'
                            : error.message
                    )
                },
            })
        }
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-300 bg-slate-50 px-5 py-4">
            <div className="min-w-0">
                <p className="font-medium">{summary.headline}</p>
                <p className="text-sm text-slate-600">
                    {summary.papers} · the ones you got wrong or found slow, to
                    try again at exam pace.
                </p>
            </div>
            <Button className="shrink-0 cursor-pointer" disabled={isPending} onClick={go}>
                {isPending
                    ? 'Getting it ready…'
                    : ready.length > 1
                      ? 'See them →'
                      : ready[0].pendingAttemptId
                        ? 'Resume →'
                        : 'Redeem now →'}
            </Button>
        </div>
    )
}
