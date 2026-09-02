import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SeasonChoice } from './SeasonChoice'
import type { SeasonOffer } from '@/lib/billingApi.ts'

/** The one season actually on sale: a single pass running past both sittings. */
function season(over: Partial<SeasonOffer> = {}): SeasonOffer {
    return {
        key: '2026-27',
        label: '2026/27 season',
        lastDay: '2027-01-31',
        priceAmount: 5900,
        priceCurrency: 'GBP',
        alreadyCovered: false,
        ...over,
    }
}

/**
 * A second season that is not sold today.
 *
 * The component renders a list because the backend offers a list, and a
 * second window should be a data change rather than a rewrite of the point of
 * sale. Without a fixture like this, every multi-season path — naming each
 * season on its button, joining the end dates, greying out one and leaving
 * the other live — would go untested until the day that promise was called
 * in.
 */
const LATER = season({
    key: '2027-28',
    label: '2027/28 season',
    lastDay: '2028-01-31',
    priceAmount: 6900,
})

describe('SeasonChoice', () => {
    describe('the one season on sale', () => {
        it('does not name the season when there is nothing to choose between', () => {
            // "2026/27 season — £59" invites "as opposed to which?". With one
            // pass on sale that question has no answer, so it is not raised.
            render(<SeasonChoice seasons={[season()]} onChoose={() => {}} />)
            expect(
                screen.getByRole('button', { name: /^Unlock — £59\.00$/ })
            ).toBeInTheDocument()
        })

        it('still says when access runs out', () => {
            // What is being sold is access until a date. The button stops
            // naming the season; it must not stop saying this.
            render(<SeasonChoice seasons={[season()]} onChoose={() => {}} />)
            expect(
                screen.getByText(/Access runs until 31 January 2027/)
            ).toBeInTheDocument()
        })

        it('still works when Stripe would not give us a price', () => {
            // A price we cannot display is a worse button, not a broken one —
            // Stripe's own page shows the real number.
            render(
                <SeasonChoice
                    seasons={[season({ priceAmount: null, priceCurrency: null })]}
                    onChoose={() => {}}
                />
            )
            expect(
                screen.getByRole('button', { name: /^Unlock$/ })
            ).toBeInTheDocument()
        })

        it('greys out the pass a student already holds', () => {
            // Rather than hiding it: a card that silently loses its only
            // button reads as broken, not as "you already have this".
            render(
                <SeasonChoice
                    seasons={[season({ alreadyCovered: true })]}
                    onChoose={() => {}}
                />
            )
            expect(
                screen.getByText(/already covered by your pass/i)
            ).toBeInTheDocument()
            expect(screen.queryByRole('button')).not.toBeInTheDocument()
        })

        it('passes the season key back, not the label', () => {
            const onChoose = vi.fn()
            render(<SeasonChoice seasons={[season()]} onChoose={onChoose} />)
            fireEvent.click(screen.getByRole('button'))
            expect(onChoose).toHaveBeenCalledWith('2026-27')
        })
    })

    describe('if a second season is ever added', () => {
        it('names each one, because now there is a choice', () => {
            render(<SeasonChoice seasons={[season(), LATER]} onChoose={() => {}} />)
            expect(
                screen.getByRole('button', { name: /2026\/27 season — £59\.00/ })
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /2027\/28 season — £69\.00/ })
            ).toBeInTheDocument()
        })

        it('contrasts the end dates in one sentence rather than under each button', () => {
            render(<SeasonChoice seasons={[season(), LATER]} onChoose={() => {}} />)
            expect(
                screen.getByText(/31 January 2027 or 31 January 2028/)
            ).toBeInTheDocument()
        })

        it('greys out the covered one and leaves the other buyable', () => {
            render(
                <SeasonChoice
                    seasons={[season({ alreadyCovered: true }), LATER]}
                    onChoose={() => {}}
                />
            )
            expect(
                screen.getByText(/already covered by your pass/i)
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /2026\/27/ })
            ).not.toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /2027\/28/ })
            ).toBeInTheDocument()
        })
    })

    it('renders nothing at all when there is nothing to sell', () => {
        const { container } = render(
            <SeasonChoice seasons={[]} onChoose={() => {}} />
        )
        expect(container).toBeEmptyDOMElement()
    })
})
