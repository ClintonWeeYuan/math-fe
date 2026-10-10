import { Card, CardContent } from '@/components/ui/card.tsx'
import {
    outcomeClosing,
    outcomeDetail,
    outcomeStatus,
    type OutcomeStatus,
    type RedemptionOutcome,
} from '@/lib/redemption.ts'

const STATUS_STYLE: Record<OutcomeStatus, string> = {
    Redeemed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    'Not yet': 'border-amber-200 bg-amber-50 text-amber-800',
    Retired: 'border-slate-200 bg-white text-slate-600',
}

/**
 * The per-question list on a redemption sitting's report: Redeemed, Not yet,
 * or Retired, each with one line saying why and what happens next. Labelled
 * by position in the paper it came from ("Q12"), which is how the student
 * remembers it, not by position in this sitting.
 */
export function RedemptionOutcomes({ outcomes }: { outcomes: RedemptionOutcome[] }) {
    if (outcomes.length === 0) return null
    return (
        <section className="flex flex-col gap-3">
            <Card>
                <CardContent className="pt-2">
                    {outcomes.map((o) => {
                        const status = outcomeStatus(o)
                        // Right but slow is the one that reads as a surprise,
                        // so it gets the amber of "not yet", not the red of
                        // wrong.
                        const tone =
                            status === 'Not yet' && o.isCorrect !== true
                                ? 'border-red-200 bg-red-50 text-red-700'
                                : STATUS_STYLE[status]
                        return (
                            <div
                                key={o.questionId}
                                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-slate-100 py-2.5 last:border-b-0"
                            >
                                <span className="w-9 shrink-0 text-xs text-slate-500">
                                    Q{o.sourceOrderIndex + 1}
                                </span>
                                <span
                                    className={`rounded-full border px-2.5 py-0.5 text-xs ${tone}`}
                                >
                                    {status}
                                </span>
                                <span className="text-sm text-slate-600">
                                    {outcomeDetail(o)}
                                </span>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
            <p className="text-gray-700">{outcomeClosing(outcomes)}</p>
        </section>
    )
}
