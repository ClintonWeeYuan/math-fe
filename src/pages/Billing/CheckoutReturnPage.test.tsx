import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CheckoutReturnPage } from './CheckoutReturnPage'

/**
 * The page Stripe redirects to after payment. Its job is to wait out the gap
 * between paying and owning — the entitlement is written by the webhook, not
 * by this redirect — without ever implying the payment failed, because at
 * this point the money has already left the student's account.
 */

const mockStatus = vi.fn()
const mockNavigate = vi.fn()

vi.mock('@/hooks/billing/useBillingStatusQuery.ts', () => ({
    default: (...a: unknown[]) => mockStatus(...a),
}))
vi.mock('react-router-dom', async () => {
    const actual =
        await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
    return { ...actual, useNavigate: () => mockNavigate }
})

function renderPage(search = '?session_id=cs_test_1') {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    return render(
        <QueryClientProvider client={client}>
            <MemoryRouter initialEntries={[`/billing/return${search}`]}>
                <CheckoutReturnPage />
            </MemoryRouter>
        </QueryClientProvider>
    )
}

beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    mockStatus.mockReset()
    mockNavigate.mockReset()
    mockStatus.mockReturnValue({ data: undefined, isError: false })
})

afterEach(() => {
    vi.useRealTimers()
})

describe('CheckoutReturnPage', () => {
    it('polls while the webhook has not landed yet', () => {
        renderPage()
        expect(mockStatus).toHaveBeenCalledWith({
            signedIn: true,
            pollUntilPass: true,
        })
        expect(screen.getByText(/Confirming your payment/i)).toBeInTheDocument()
    })

    it('confirms once the pass shows up', () => {
        mockStatus.mockReturnValue({
            data: { hasPass: true, product: 'season_pass_2026' },
            isError: false,
        })
        renderPage()
        expect(screen.getByText(/Season Pass unlocked/i)).toBeInTheDocument()
    })

    it('drops the caches that are still showing a locked report', () => {
        // Every screen that renders differently for a pass holder is holding
        // a cached "no" from before the purchase.
        mockStatus.mockReturnValue({
            data: { hasPass: true, product: 'season_pass_2026' },
            isError: false,
        })
        const client = new QueryClient()
        const invalidate = vi.spyOn(client, 'invalidateQueries')
        render(
            <QueryClientProvider client={client}>
                <MemoryRouter initialEntries={['/billing/return?session_id=cs_1']}>
                    <CheckoutReturnPage />
                </MemoryRouter>
            </QueryClientProvider>
        )
        const keys = invalidate.mock.calls.map((c) => c[0]?.queryKey)
        expect(keys).toContainEqual(['diagnostic-report'])
    })

    it('never tells a student who paid that anything failed', () => {
        // The one wording that must not appear. Sending someone to their bank
        // over a webhook that is half a second late is worse than any delay.
        renderPage()
        act(() => {
            vi.advanceTimersByTime(30000)
        })
        expect(screen.getByText(/still finalising/i)).toBeInTheDocument()
        expect(screen.getByText(/Your payment went through/i)).toBeInTheDocument()
        expect(screen.queryByText(/failed/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
    })

    it('says something different to someone who never paid', () => {
        // No session_id means they typed the URL rather than arriving from
        // Stripe. Telling them "your payment went through" would be false.
        renderPage('')
        act(() => {
            vi.advanceTimersByTime(30000)
        })
        expect(
            screen.getByText(/couldn't confirm a Season Pass/i)
        ).toBeInTheDocument()
    })

    it('stops waiting if the status call itself fails', () => {
        mockStatus.mockReturnValue({ data: undefined, isError: true })
        renderPage()
        expect(screen.getByText(/still finalising/i)).toBeInTheDocument()
    })
})
