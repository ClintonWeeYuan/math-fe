import { Button } from '@/components/ui/button.tsx'
import { formatSeasonEnd, formatSeasonPrice } from '@/lib/billing.ts'
import type { SeasonOffer } from '@/lib/billingApi.ts'

type Props = {
    /** On-sale seasons from GET /billing/me, soonest first. */
    seasons: SeasonOffer[]
    /** Opens checkout for one season. */
    onChoose: (seasonKey: string) => void
    isPending?: boolean
    /** Tighter type for the report's narrow paywall card. */
    compact?: boolean
}

/**
 * The buy control: one button per season on sale.
 *
 * Two windows are sold at once — October and January — because in September
 * an Oxford applicant needs October and a candidate whose course accepts
 * January needs January, and both are shopping. Picking for them would sell
 * one of the two a pass that dies before their exam.
 *
 * Every button states its own end date and price. What is being sold is
 * access until a date, and the point of sale is where that has to be said —
 * not in a receipt afterwards.
 *
 * A season the student is already covered for is shown, disabled, rather than
 * hidden: an October holder looking at a greyed-out October and a live
 * January understands the ladder, where a card with one button looks like a
 * mistake.
 */
export function SeasonChoice({ seasons, onChoose, isPending, compact }: Props) {
    if (seasons.length === 0) return null

    const buyable = seasons.filter((s) => !s.alreadyCovered)

    return (
        <div className="flex flex-col gap-2">
            {seasons.map((season) => {
                const price = formatSeasonPrice(
                    season.priceAmount,
                    season.priceCurrency
                )
                if (season.alreadyCovered) {
                    return (
                        <div
                            key={season.key}
                            className="rounded-md border border-dashed px-3 py-2 text-left text-xs text-gray-500"
                        >
                            {season.label} — already covered by your pass
                        </div>
                    )
                }
                return (
                    <Button
                        key={season.key}
                        type="button"
                        size={compact ? 'default' : 'lg'}
                        // Never full-bleed in the wide layouts: a button that
                        // spans a 42rem column reads as a banner.
                        className={compact ? 'w-full' : 'self-start'}
                        disabled={isPending}
                        onClick={() => onChoose(season.key)}
                    >
                        {isPending
                            ? 'Opening checkout…'
                            : price
                              ? `${season.label} — ${price}`
                              : `Unlock for ${season.label}`}
                    </Button>
                )
            })}

            {buyable.length > 0 && (
                <p
                    className={
                        compact
                            ? 'text-xs text-gray-500'
                            : 'text-sm text-gray-500'
                    }
                >
                    {buyable.length > 1
                        ? // Said once rather than under each button: the only
                          // difference between the two is how long they last,
                          // so the contrast is the useful sentence.
                          `Access runs until ${buyable
                              .map((s) => formatSeasonEnd(s.lastDay))
                              .join(' or ')} — pick the sitting you're taking.`
                        : `Access runs until ${formatSeasonEnd(buyable[0].lastDay)}.`}
                </p>
            )}
        </div>
    )
}
