import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SavedToRedeem } from './SavedToRedeem'

const mockFetchConsent = vi.fn()
const mockSaveConsent = vi.fn()
vi.mock('@/lib/emailConsentApi.ts', () => ({
    REDEMPTION_EMAIL_CONSENT_QUERY_KEY: ['redemption-email-consent'],
    fetchRedemptionEmailConsent: () => mockFetchConsent(),
    saveRedemptionEmailConsent: (v: boolean) => mockSaveConsent(v),
}))

/**
 * The "Saved to redeem" card on a full paper's report. It must say what was
 * kept and when it unlocks, and it must never claim "nothing to redeem"
 * unless the paper was actually perfect.
 */

const queued = {
    count: 3,
    wrongCount: 2,
    blankCount: 0,
    slowCount: 1,
    availableFrom: '2026-10-17T12:00:00Z',
    items: [
        { questionId: 'a', questionOrderIndex: 2, reason: 'wrong' as const, originalSeconds: 80 },
        { questionId: 'b', questionOrderIndex: 6, reason: 'wrong' as const, originalSeconds: 95 },
        { questionId: 'c', questionOrderIndex: 13, reason: 'slow' as const, originalSeconds: 250 },
    ],
}

const show = (props: Parameters<typeof SavedToRedeem>[0]) => {
    mockFetchConsent.mockResolvedValue({
        optedIn: false,
        wording: 'Email me when these questions unlock.',
    })
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    return render(
        <QueryClientProvider client={client}>
            <MemoryRouter>
                <SavedToRedeem {...props} />
            </MemoryRouter>
        </QueryClientProvider>
    )
}

describe('SavedToRedeem', () => {
    it('says what was kept, when it unlocks, and which questions', () => {
        show({ queued, allRight: false })

        expect(screen.getByText('Saved to redeem')).toBeInTheDocument()
        expect(
            screen.getByText(
                "We've kept 3 questions from this paper for you to try again: 2 you got wrong and 1 that took a while."
            )
        ).toBeInTheDocument()
        expect(screen.getByText('Saturday 17 October')).toBeInTheDocument()
        expect(screen.getByText('Q3 · wrong')).toBeInTheDocument()
        expect(screen.getByText('Q14 · 4 min 10 s')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'See all my redemption questions →' })
        ).toBeInTheDocument()
    })

    it('offers the unlock email with the backend\'s wording and saves a tick', async () => {
        mockSaveConsent.mockResolvedValue({ optedIn: true, wording: 'Email me when these questions unlock.' })
        show({ queued, allRight: false })
        const box = await screen.findByRole('checkbox')
        expect(screen.getByText('Email me when these questions unlock.')).toBeInTheDocument()
        fireEvent.click(box)
        await waitFor(() => expect(mockSaveConsent).toHaveBeenCalledWith(true))
    })

    it('praises a perfect paper', () => {
        show({ queued: { ...queued, count: 0, items: [] }, allRight: true })
        expect(screen.getByText(/Nothing to redeem from this paper/)).toBeInTheDocument()
    })

    it('renders nothing when nothing was queued for any other reason', () => {
        // An old report, or questions already in flight from another paper:
        // "nothing to redeem" would be a claim the card cannot back.
        const { container } = show({ queued: null, allRight: false })
        expect(container).toBeEmptyDOMElement()
    })
})
