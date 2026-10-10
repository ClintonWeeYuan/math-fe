import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RedemptionSection } from './RedemptionSection'
import type { RedemptionGroup } from '@/lib/redemption.ts'

/**
 * The "Redemption questions" section on My results: hidden when empty, one
 * card per paper, and a button that says what will happen next.
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
                <RedemptionSection />
            </MemoryRouter>
        </QueryClientProvider>
    )
}

describe('RedemptionSection', () => {
    beforeEach(() => {
        mockFetch.mockReset()
        mockBuild.mockReset()
        mockNavigate.mockReset()
    })

    it('renders nothing for an empty queue', async () => {
        mockFetch.mockResolvedValue([])
        const { container } = show()
        await waitFor(() => expect(mockFetch).toHaveBeenCalled())
        expect(container).toBeEmptyDOMElement()
    })

    it('shows a locked paper with its unlock date', async () => {
        mockFetch.mockResolvedValue([
            group({ readyCount: 0, batchSize: 0, batchMinutes: 0, unlocksAt: '2026-10-17T12:00:00Z' }),
        ])
        show()
        expect(await screen.findByText('Redemption questions')).toBeInTheDocument()
        expect(screen.getByText('ESAT Maths 1')).toBeInTheDocument()
        expect(screen.getByText('4 wrong')).toBeInTheDocument()
        expect(screen.getByText('2 slow')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Unlocks Sat 17 Oct' })).toBeDisabled()
    })

    it('builds a sitting and goes to its start page', async () => {
        mockFetch.mockResolvedValue([group()])
        mockBuild.mockResolvedValue({ setId: 'rset-1', questionCount: 6, timeLimitMinutes: 9 })
        show()
        fireEvent.click(await screen.findByRole('button', { name: 'Redeem 6 questions →' }))
        await waitFor(() => expect(mockBuild).toHaveBeenCalledWith('set-1'))
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/diagnostic/sets/rset-1'))
    })

    it('offers to continue a sitting already built', async () => {
        mockFetch.mockResolvedValue([group({ readyCount: 0, batchSize: 0, pendingSetId: 'rset-1' })])
        show()
        fireEvent.click(await screen.findByRole('button', { name: 'Continue →' }))
        expect(mockNavigate).toHaveBeenCalledWith('/diagnostic/sets/rset-1')
        expect(mockBuild).not.toHaveBeenCalled()
    })

    it('offers to resume a sitting under way', async () => {
        mockFetch.mockResolvedValue([
            group({ readyCount: 0, batchSize: 0, pendingSetId: 'rset-1', pendingAttemptId: 'att-1' }),
        ])
        show()
        fireEvent.click(await screen.findByRole('button', { name: 'Resume →' }))
        expect(mockNavigate).toHaveBeenCalledWith('/diagnostic/attempts/att-1')
    })
})
