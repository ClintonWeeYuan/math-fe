import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RedemptionReadyBanner } from './RedemptionReadyBanner'
import type { RedemptionGroup } from '@/lib/redemption.ts'

/**
 * The one-line invitation on the report and home page. It must say how many
 * questions are ready and from which papers, go straight to a single paper's
 * sitting, and render nothing when there is nothing ready or nobody signed in.
 */

const mockFetch = vi.fn()
const mockBuild = vi.fn()
vi.mock('@/lib/redemption.ts', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/lib/redemption.ts')>()
    return {
        ...actual,
        fetchRedemptionQueue: () => mockFetch(),
        buildRedemptionSet: (id: string) => mockBuild(id),
    }
})

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>()
    return { ...actual, useNavigate: () => mockNavigate }
})

const mockTrack = vi.fn()
vi.mock('@/lib/analytics.ts', () => ({
    trackEvent: (...args: unknown[]) => mockTrack(...args),
}))

let signedIn = true
vi.mock('@/components/auth/AuthContext.tsx', () => ({
    useAuth: () => ({
        user: signedIn ? { id: 'u1', name: 'Amira', email: 'a@example.com', userType: 'USER' } : null,
        isLoading: false,
    }),
}))

const group = (over: Partial<RedemptionGroup> = {}): RedemptionGroup => ({
    sourceSetId: 'set-1',
    title: 'ESAT Maths 1 — Set A',
    subject: 'ESAT Maths 1',
    isFree: true,
    questionCount: 6,
    wrongCount: 4,
    blankCount: 0,
    slowCount: 2,
    readyCount: 6,
    batchSize: 6,
    batchMinutes: 9,
    unlocksAt: null,
    latestSourceSubmittedAt: '2026-10-10T12:00:00Z',
    ...over,
})

function show() {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    return render(
        <QueryClientProvider client={client}>
            <MemoryRouter>
                <RedemptionReadyBanner source="report" />
            </MemoryRouter>
        </QueryClientProvider>
    )
}

describe('RedemptionReadyBanner', () => {
    beforeEach(() => {
        signedIn = true
        mockFetch.mockReset()
        mockBuild.mockReset()
        mockNavigate.mockReset()
        mockTrack.mockReset()
    })

    it('renders nothing when signed out, without asking the server', async () => {
        signedIn = false
        mockFetch.mockResolvedValue([group()])
        const { container } = show()
        await new Promise((r) => setTimeout(r, 20))
        expect(container).toBeEmptyDOMElement()
        expect(mockFetch).not.toHaveBeenCalled()
    })

    it('renders nothing when nothing is ready', async () => {
        mockFetch.mockResolvedValue([
            group({ readyCount: 0, batchSize: 0, unlocksAt: '2026-10-17T12:00:00Z' }),
        ])
        const { container } = show()
        await waitFor(() => expect(mockFetch).toHaveBeenCalled())
        expect(container).toBeEmptyDOMElement()
    })

    it('counts the ready questions and builds the sitting for one paper', async () => {
        mockFetch.mockResolvedValue([group()])
        mockBuild.mockResolvedValue({ setId: 'rset-1', questionCount: 6, timeLimitMinutes: 9 })
        show()
        expect(await screen.findByText('6 questions ready to redeem')).toBeInTheDocument()
        expect(screen.getByText(/From ESAT Maths 1/)).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Redeem now →' }))
        await waitFor(() => expect(mockBuild).toHaveBeenCalledWith('set-1'))
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/diagnostic/sets/rset-1'))
        expect(mockTrack).toHaveBeenCalledWith('redemption_banner_clicked', {
            metadata: { source: 'report', papers: 1, questions: 6 },
        })
    })

    it('sends several papers to the results section', async () => {
        mockFetch.mockResolvedValue([
            group(),
            group({ sourceSetId: 'set-2', subject: 'ESAT Physics', readyCount: 13, batchSize: 10, batchMinutes: 15 }),
        ])
        show()
        expect(await screen.findByText('16 questions ready to redeem')).toBeInTheDocument()
        expect(screen.getByText(/From ESAT Maths 1 and ESAT Physics/)).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'See them →' }))
        expect(mockNavigate).toHaveBeenCalledWith('/my-results#redemption')
        expect(mockBuild).not.toHaveBeenCalled()
    })

    it('resumes a sitting already under way', async () => {
        mockFetch.mockResolvedValue([
            group({ readyCount: 0, batchSize: 0, pendingSetId: 'rset-1', pendingAttemptId: 'att-1' }),
        ])
        show()
        fireEvent.click(await screen.findByRole('button', { name: 'Resume →' }))
        expect(mockNavigate).toHaveBeenCalledWith('/diagnostic/attempts/att-1')
    })
})
