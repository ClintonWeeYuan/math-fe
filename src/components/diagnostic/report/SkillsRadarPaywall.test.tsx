import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SkillsRadarPaywall } from './SkillsRadarPaywall'
import type { SeasonOffer } from '@/lib/billingApi.ts'

const SEASONS: SeasonOffer[] = [
    {
        key: 'oct-2026',
        label: 'October 2026',
        test: 'esat',
        lastDay: '2026-10-16',
        priceAmount: 9900,
        priceCurrency: 'MYR',
        alreadyCovered: false,
    },
    {
        key: 'jan-2027',
        label: 'January 2027',
        test: 'esat',
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

describe('offering the right pass', () => {
    it('offers the TMUA pass on a TMUA report, not the ESAT one', () => {
        // The caller passes every season on sale. Before the split that was
        // the same thing as "the pass for this paper"; after it, a TMUA
        // report offered ESAT — and to a holder of ESAT, offered it as
        // "already covered by your pass" on a report it does not open.
        render(
            <SkillsRadarPaywall
                subject="TMUA Paper 1"
                onUnlock={() => {}}
                seasons={[
                    { key: 'esat-2026-27', label: 'ESAT Season Pass', test: 'esat',
                      lastDay: '2027-01-31', priceAmount: 5900, priceCurrency: 'GBP',
                      alreadyCovered: true },
                    { key: 'tmua-2026-27', label: 'TMUA Season Pass', test: 'tmua',
                      lastDay: '2027-01-31', priceAmount: 5900, priceCurrency: 'GBP',
                      alreadyCovered: false },
                ]}
            />
        )
        expect(screen.queryByText(/ESAT Season Pass/)).not.toBeInTheDocument()
        expect(screen.queryByText(/already covered/i)).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Unlock/i })).toBeInTheDocument()
    })

    it('shows no buy control when nothing is on sale for this test', () => {
        // TMUA before its Price exists. An unlock CTA would dead-end.
        render(
            <SkillsRadarPaywall
                subject="TMUA Paper 1"
                onUnlock={() => {}}
                seasons={[
                    { key: 'esat-2026-27', label: 'ESAT Season Pass', test: 'esat',
                      lastDay: '2027-01-31', priceAmount: 5900, priceCurrency: 'GBP',
                      alreadyCovered: false },
                ]}
            />
        )
        expect(screen.queryByRole('button', { name: /Unlock/i })).not.toBeInTheDocument()
    })
})
