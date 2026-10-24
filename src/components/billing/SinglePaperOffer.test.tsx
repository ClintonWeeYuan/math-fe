import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { SinglePaperOffer } from './SinglePaperOffer'

const offer = {
    test: 'esat',
    lastDay: '2027-01-31',
    priceAmount: 1200,
    priceCurrency: 'GBP',
}

describe('SinglePaperOffer', () => {
    it('names the price and the last day, and buys on click', () => {
        const onBuy = vi.fn()
        render(
            <SinglePaperOffer tier="challenge" offer={offer} onBuy={onBuy} besidePass />
        )
        expect(screen.getByText(/Or just this paper\. The hardest question types/)).toBeInTheDocument()
        expect(screen.getByText(/Open until 31 January 2027/)).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Buy this paper — £12.00' }))
        expect(onBuy).toHaveBeenCalledOnce()
    })

    it('stands alone when no pass is on sale beside it', () => {
        render(
            <SinglePaperOffer
                tier="foundations"
                offer={{ ...offer, priceAmount: null, priceCurrency: null }}
                onBuy={() => {}}
                besidePass={false}
            />
        )
        expect(screen.queryByText(/Or just this paper/)).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Buy this paper' })).toBeInTheDocument()
    })
})
