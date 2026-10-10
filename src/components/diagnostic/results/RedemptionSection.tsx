import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import useRedemptionQueueQuery from '@/hooks/diagnostic/useRedemptionQueueQuery.ts'
import useBuildRedemptionSetMutation from '@/hooks/diagnostic/useBuildRedemptionSetMutation.ts'
import type { DiagnosticApiError } from '@/lib/diagnosticApiError.ts'
import {
    formatUnlockShort,
    groupAction,
    groupChips,
    groupMeta,
    type RedemptionGroup,
} from '@/lib/redemption.ts'

function chipTone(label: string): string {
    return label.endsWith('slow')
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-red-200 bg-red-50 text-red-700'
}

function GroupCard({
    group,
    onRedeem,
    isBuilding,
}: {
    group: RedemptionGroup
    onRedeem: (sourceSetId: string) => void
    isBuilding: boolean
}) {
    const navigate = useNavigate()
    // Four states, in the order a student meets them: sitting under way,
    // sitting built but not started, questions ready, nothing ready yet.
    const action = group.pendingAttemptId ? (
        <Button
            className="cursor-pointer"
            onClick={() => navigate(`/diagnostic/attempts/${group.pendingAttemptId}`)}
        >
            Resume →
        </Button>
    ) : group.pendingSetId ? (
        <Button
            className="cursor-pointer"
            onClick={() => navigate(`/diagnostic/sets/${group.pendingSetId}`)}
        >
            Continue →
        </Button>
    ) : group.batchSize > 0 ? (
        <Button
            className="cursor-pointer"
            disabled={isBuilding}
            onClick={() => onRedeem(group.sourceSetId)}
        >
            {isBuilding ? 'Getting it ready…' : groupAction(group)}
        </Button>
    ) : (
        <Button variant="secondary" disabled>
            Unlocks {formatUnlockShort(group.unlocksAt)}
        </Button>
    )
    const ready = group.batchSize > 0 || !!group.pendingSetId

    return (
        <Card className={ready ? 'border-slate-300 bg-slate-50' : undefined}>
            <CardContent className="flex flex-wrap items-start justify-between gap-4 pt-6">
                <div className="flex min-w-0 flex-col gap-1">
                    <p className="font-medium">{group.subject ?? group.title}</p>
                    <p className="text-sm text-slate-500">{groupMeta(group)}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                        {groupChips(group).map((label) => (
                            <span
                                key={label}
                                className={`rounded-full border px-2.5 py-0.5 text-xs ${chipTone(label)}`}
                            >
                                {label}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="shrink-0">{action}</div>
            </CardContent>
        </Card>
    )
}

/**
 * "Redemption questions" — the section at the top of My results.
 *
 * Hidden entirely when the queue is empty or cannot be loaded: most students
 * have nothing here most of the time, and a feature they have not met yet
 * should not announce itself with an error. One card per source paper, so a
 * sitting only ever holds one paper's questions at that paper's pace.
 */
export function RedemptionSection() {
    const navigate = useNavigate()
    const { hash } = useLocation()
    const { data: groups } = useRedemptionQueueQuery()
    const { mutate: build, isPending, variables } = useBuildRedemptionSetMutation()
    const section = useRef<HTMLElement>(null)

    // The report's "See all my redemption questions" link lands on
    // /my-results#redemption. Nothing in the app scrolls to a hash, and the
    // section does not exist until the queue has loaded, so it scrolls
    // itself into view once it has rendered.
    const loaded = (groups?.length ?? 0) > 0
    useEffect(() => {
        if (loaded && hash === '#redemption') {
            section.current?.scrollIntoView({ block: 'start' })
        }
    }, [loaded, hash])

    if (!groups || groups.length === 0) return null

    function redeem(sourceSetId: string) {
        build(sourceSetId, {
            onSuccess: (built) => navigate(`/diagnostic/sets/${built.setId}`),
            onError: (error) => {
                const status = (error as DiagnosticApiError).status
                toast(
                    status === 402
                        ? "This paper is part of the Season Pass, which has ended for you, so its questions are closed."
                        : status === 409
                          ? 'These questions are not ready to redeem yet.'
                          : error.message
                )
            },
        })
    }

    return (
        <section id="redemption" ref={section} className="mb-12 scroll-mt-24">
            <h2 className="text-xl font-medium mb-1">Redemption questions</h2>
            <p className="text-sm text-slate-500 mb-4">
                Questions you got wrong or found slow, ready to try again once
                they&apos;ve had time to settle.
            </p>
            <div className="flex flex-col gap-3">
                {groups.map((group) => (
                    <GroupCard
                        key={group.sourceSetId}
                        group={group}
                        onRedeem={redeem}
                        isBuilding={isPending && variables === group.sourceSetId}
                    />
                ))}
            </div>
        </section>
    )
}
