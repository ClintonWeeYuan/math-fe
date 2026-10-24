import { Button } from '@/components/ui/button.tsx'
import { formatSeasonEnd, formatSeasonPrice } from '@/lib/billing.ts'
import type { PaperOffer } from '@/lib/billingApi.ts'
import { TIER_COPY, type SinglePaperTier } from '@/lib/singlePapers.ts'

type Props = {
    tier: SinglePaperTier
    offer: PaperOffer
    onBuy: () => void
    isPending?: boolean
    /** True when the Season Pass is offered above it, so this reads as the
     *  smaller alternative rather than the only way in. */
    besidePass: boolean
}

/**
 * Buying one Challenge or Foundations paper on its own.
 *
 * Shown under the pass, as the smaller option, rather than instead of it: the
 * pass opens every paper for the same test, and a student who only ever sees
 * the £12 button cannot weigh the two.
 */
export function SinglePaperOffer({
    tier,
    offer,
    onBuy,
    isPending,
    besidePass,
}: Props) {
    const price = formatSeasonPrice(offer.priceAmount, offer.priceCurrency)
    const copy = TIER_COPY[tier]
    return (
        <div
            className={
                besidePass
                    ? 'flex flex-col gap-2 border-t pt-3'
                    : 'flex flex-col gap-2'
            }
        >
            <p className="text-sm text-gray-600">
                {besidePass ? 'Or just this paper. ' : ''}
                {copy.blurb} Open until {formatSeasonEnd(offer.lastDay)}, with
                worked solutions and your full skills report.
            </p>
            <Button
                type="button"
                size="lg"
                variant={besidePass ? 'outline' : 'default'}
                className="self-start"
                disabled={isPending}
                onClick={onBuy}
            >
                {isPending
                    ? 'Opening checkout…'
                    : price
                      ? `Buy this paper — ${price}`
                      : 'Buy this paper'}
            </Button>
        </div>
    )
}
