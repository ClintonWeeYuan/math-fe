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
 * One season is sold today — a single pass running past both the October and
 * January sittings — so in practice this renders one button. It is still
 * written for a list, because the backend offers a list and a second window
 * should be a data change rather than a rewrite of the point of sale.
 *
 * The button names the season only when there is a choice to make. With one
 * on sale there is nothing to choose between, and "2026/27 season — £59"
 * invites a question ("as opposed to which?") that a plain "Unlock — £59"
 * does not raise. The end date is stated underneath either way: what is being
 * sold is access until a date, and the point of sale is where that has to be
 * said, not a receipt afterwards.
 *
 * A season the student is already covered for is shown, disabled, rather than
 * hidden — a card that silently loses its only button reads as broken.
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
                            : // Keyed to what is on screen, not to what is
                              // buyable: when one of two is greyed out and
                              // names itself, an unnamed live button beside it
                              // is harder to read, not easier.
                              seasons.length > 1
                              ? price
                                  ? `${season.label} — ${price}`
                                  : `Unlock for ${season.label}`
                              : price
                                ? `Unlock — ${price}`
                                : 'Unlock'}
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
