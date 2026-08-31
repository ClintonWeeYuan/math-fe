import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SkillsRadarPaywall } from './SkillsRadarPaywall'
import type { SeasonOffer } from '@/lib/billingApi.ts'

const SEASONS: SeasonOffer[] = [
    {
        key: 'oct-2026',
        label: 'October 2026',
        lastDay: '2026-10-16',
        priceAmount: 9900,
        priceCurrency: 'MYR',
        alreadyCovered: false,
    },
    {
        key: 'jan-2027',
        label: 'January 2027',
        lastDay: '2027-01-08',
        priceAmount: 14900,
        priceCurrency: 'MYR',
        alreadyCovered: false,
    },
]

describe('SkillsRadarPaywall', () => {
    it('names the real skills so the lock is informative', () => {
        render(<SkillsRadarPaywall subject="ESAT Physics" />)
        // A real framework name, not a placeholder or an S-code.
        expect(screen.getByText(/Unlock your skill-by-skill/i)).toBeInTheDocument()
        const labels = screen.getAllByText(/[a-z]/i)
        expect(labels.length).toBeGreaterThan(3)
    })

    it('reassures that the free tier is retained', () => {
        render(<SkillsRadarPaywall subject="ESAT Physics" />)
        expect(screen.getByText(/score and timing above stay free/i)).toBeInTheDocument()
    })

    it('offers both sittings, each saying when it runs out', () => {
        // A season, not a perpetual licence — and this is the point of sale.
        render(
            <SkillsRadarPaywall
                subject="ESAT Physics"
                onUnlock={() => {}}
                seasons={SEASONS}
            />
        )
        expect(
            screen.getByRole('button', { name: /October 2026/ })
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /January 2027/ })
        ).toBeInTheDocument()
        expect(screen.getByText(/16 October 2026 or 8 January 2027/)).toBeInTheDocument()
    })

    it('renders no CTA when there is nothing on sale', () => {
        // Before billing ships, and after both windows have passed. The
        // blurred radar and its explanation still show — that part is true
        // either way.
        render(<SkillsRadarPaywall subject="ESAT Physics" onUnlock={() => {}} seasons={[]} />)
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('passes the chosen season key up', () => {
        const onUnlock = vi.fn()
        render(
            <SkillsRadarPaywall
                subject="ESAT Physics"
                onUnlock={onUnlock}
                seasons={SEASONS}
            />
        )
        fireEvent.click(screen.getByRole('button', { name: /January 2027/ }))
        expect(onUnlock).toHaveBeenCalledWith('jan-2027')
    })

    it('omits the CTA when no handler is given (billing not wired yet)', () => {
        render(<SkillsRadarPaywall subject="ESAT Physics" />)
        expect(screen.queryByText(/Unlock full report/i)).not.toBeInTheDocument()
    })
})
