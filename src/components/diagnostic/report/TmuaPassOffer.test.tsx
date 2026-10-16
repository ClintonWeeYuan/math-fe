import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { TmuaPassOffer } from './TmuaPassOffer'
import type { SeasonOffer } from '@/lib/billingApi.ts'

const track = vi.fn()
vi.mock('@/lib/analytics.ts', () => ({ trackEvent: (...a: unknown[]) => track(...a) }))

const paid = (subject: string, letter: string) => ({
    id: `${subject}-${letter}`,
    title: `${subject} — Diagnostic Set ${letter}`,
    subject,
    isFree: false,
    format: 'full',
})
let sets: unknown[] = []
vi.mock('@/hooks/diagnostic/useListPublishedSetsQuery.ts', () => ({
    default: () => ({ data: sets }),
}))

const season: SeasonOffer = {
    key: 'tmua-2026-27',
    test: 'tmua',
    label: 'TMUA Season Pass',
    lastDay: '2027-01-31',
    priceAmount: 5900,
    priceCurrency: 'GBP',
    alreadyCovered: false,
} as SeasonOffer

beforeEach(() => {
    track.mockReset()
    sets = [
        ...['B', 'C', 'D'].map((l) => paid('TMUA Paper 1', l)),
        ...['B', 'C'].map((l) => paid('TMUA Paper 2', l)),
        { id: 'free', subject: 'TMUA Paper 1', isFree: true, format: 'full' },
        { id: 'mini', subject: 'TMUA Paper 1', isFree: true, format: 'mini' },
    ]
})

describe('TmuaPassOffer', () => {
    it('says what the pass holds for each paper, and names the January sitting', () => {
        render(<TmuaPassOffer attemptId="a1" seasons={[season]} onChoose={() => {}} />)
        expect(screen.getByRole('heading', { name: 'Preparing for the January TMUA?' })).toBeInTheDocument()
        expect(
            screen.getByText(/opens 5 more full papers, 3 for Paper 1 and 2 for Paper 2,/)
        ).toBeInTheDocument()
        expect(screen.getByText(/through the January 2027 sitting/)).toBeInTheDocument()
    })

    it('records being shown and the unlock, as from the mini report', () => {
        const choose = vi.fn()
        render(<TmuaPassOffer attemptId="a1" seasons={[season]} onChoose={choose} />)
        expect(track).toHaveBeenCalledWith('paywall_shown', {
            attemptId: 'a1',
            metadata: { source: 'mini_report', season: 'tmua-2026-27' },
        })
        fireEvent.click(screen.getByRole('button', { name: /Unlock/ }))
        expect(track).toHaveBeenLastCalledWith('unlock_clicked', {
            attemptId: 'a1',
            metadata: { source: 'mini_report', season: 'tmua-2026-27' },
        })
        expect(choose).toHaveBeenCalledWith('tmua-2026-27')
    })

    it('shows nothing when there is nothing to sell', () => {
        const { container } = render(<TmuaPassOffer attemptId="a1" seasons={[]} onChoose={() => {}} />)
        expect(container).toBeEmptyDOMElement()
    })
})
