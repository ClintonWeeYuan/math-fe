import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import {
    formatUnlockDay,
    queuedChip,
    queuedSentence,
    type RedemptionQueuedSummary,
} from '@/lib/redemption.ts'

const CHIP: Record<'wrong' | 'blank' | 'slow', string> = {
    wrong: 'border-red-200 bg-red-50 text-red-700',
    blank: 'border-red-200 bg-red-50 text-red-700',
    slow: 'border-amber-200 bg-amber-50 text-amber-800',
}

/**
 * "Saved to redeem" — on a full paper's report, straight after submitting.
 *
 * Says what this paper put in the student's redemption queue and when it
 * unlocks. Rendered in the page's footer slot, so the admin view of the same
 * report never shows it. Nothing queued and a perfect paper gets a line of
 * praise; nothing queued for any other reason (an old report, a question
 * already in flight from another paper) renders nothing, because "nothing to
 * redeem" would be a claim the card cannot back.
 */
export function SavedToRedeem({
    queued,
    allRight,
}: {
    queued: RedemptionQueuedSummary | null | undefined
    allRight: boolean
}) {
    const navigate = useNavigate()

    if (!queued || queued.count === 0) {
        if (!allRight) return null
        return (
            <section className="flex flex-col gap-3">
                <h2 className="text-xl font-medium">Saved to redeem</h2>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-slate-600">
                            Nothing to redeem from this paper — every question
                            right and on pace. Nice work.
                        </p>
                    </CardContent>
                </Card>
            </section>
        )
    }

    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-xl font-medium">Saved to redeem</h2>
            <Card className="border-slate-300 bg-slate-50">
                <CardContent className="flex flex-col gap-3 pt-6">
                    <p className="text-gray-700">{queuedSentence(queued)}</p>
                    <p className="text-sm text-slate-600">
                        They unlock on{' '}
                        <strong>{formatUnlockDay(queued.availableFrom)}</strong>.
                        A week is long enough to forget the answer and
                        remember the method.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {queued.items.map((item) => (
                            <span
                                key={item.questionId}
                                className={`rounded-full border px-2.5 py-0.5 text-xs ${CHIP[item.reason]}`}
                            >
                                {queuedChip(item)}
                            </span>
                        ))}
                    </div>
                    <div>
                        <Button
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => navigate('/my-results#redemption')}
                        >
                            See all my redemption questions →
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </section>
    )
}
