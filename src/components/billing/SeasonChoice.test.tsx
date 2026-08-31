import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SeasonChoice } from './SeasonChoice'
import type { SeasonOffer } from '@/lib/billingApi.ts'

function season(over: Partial<SeasonOffer> = {}): SeasonOffer {
    return {
        key: 'oct-2026',
        label: 'October 2026',
        lastDay: '2026-10-16',
        priceAmount: 9900,
        priceCurrency: 'MYR',
        alreadyCovered: false,
        ...over,
    }
}

const JAN = season({
    key: 'jan-2027',
    label: 'January 2027',
    lastDay: '2027-01-08',
    priceAmount: 14900,
})

describe('SeasonChoice', () => {
    it('offers both sittings, priced, so a student can pick their own', () => {
        // The reason two seasons exist: in September an Oxford applicant needs
        // October and a January candidate needs January.
        render(<SeasonChoice seasons={[season(), JAN]} onChoose={() => {}} />)
        expect(
            screen.getByRole('button', { name: /October 2026/ })
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /January 2027/ })
        ).toBeInTheDocument()
    })

    it('shows the price on the button', () => {
        render(<SeasonChoice seasons={[season()]} onChoose={() => {}} />)
        expect(
            screen.getByRole('button', { name: /RM\s?99\.00/ })
        ).toBeInTheDocument()
    })

    it('says when each pass runs out', () => {
        render(<SeasonChoice seasons={[season(), JAN]} onChoose={() => {}} />)
        expect(screen.getByText(/16 October 2026 or 8 January 2027/)).toBeInTheDocument()
    })

    it('passes the season key back, not the label', () => {
        const onChoose = vi.fn()
        render(<SeasonChoice seasons={[season(), JAN]} onChoose={onChoose} />)
        fireEvent.click(screen.getByRole('button', { name: /January 2027/ }))
        expect(onChoose).toHaveBeenCalledWith('jan-2027')
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
            screen.getByRole('button', { name: /Unlock for October 2026/ })
        ).toBeInTheDocument()
    })

    it('greys out a season the student is already covered for', () => {
        // Holding January, October adds not one day — and Stripe would take
        // the money anyway.
        render(
            <SeasonChoice
                seasons={[season({ alreadyCovered: true }), JAN]}
                onChoose={() => {}}
            />
        )
        expect(screen.getByText(/already covered by your pass/i)).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /October 2026/ })
        ).not.toBeInTheDocument()
        // The upgrade is still on offer.
        expect(
            screen.getByRole('button', { name: /January 2027/ })
        ).toBeInTheDocument()
    })

    it('renders nothing at all when there is nothing to sell', () => {
        const { container } = render(
            <SeasonChoice seasons={[]} onChoose={() => {}} />
        )
        expect(container).toBeEmptyDOMElement()
    })
})
