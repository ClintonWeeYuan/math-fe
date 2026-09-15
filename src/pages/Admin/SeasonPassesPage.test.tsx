import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SeasonPassesPage } from './SeasonPassesPage'
import type { SeasonPassHolder } from '@/lib/adminSeasonPassesApi.ts'

const mockQuery = vi.fn()
vi.mock('@/hooks/billing/useSeasonPassHoldersQuery.ts', () => ({
    default: () => mockQuery(),
}))
vi.mock('@/components/layout/AdminLayout.tsx', () => ({
    AdminLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const paper = (over: Partial<SeasonPassHolder['papers'][number]>) => ({
    setId: 'set', title: 'Paper', subject: 'ESAT Math 1', test: 'esat', isFree: false,
    format: 'full', questionCount: 27, attemptCount: 0, latestAttemptId: null,
    latestStatus: null, latestScore: null, latestAnswered: 0, latestStartedAt: null,
    bestScore: null, ...over,
})

const BUYER: SeasonPassHolder = {
    studentId: 'buyer', email: 'buyer@x.com', name: 'Buyer Name', school: null,
    testSitting: 'october_2026', country: 'GB', isInternal: false,
    passes: [{
        product: 'season_pass_esat_2026_27', label: 'ESAT Season Pass', test: 'esat',
        source: 'stripe', purchasedAt: '2026-09-14T09:28:10Z',
        expiresAt: '2027-02-01T12:00:00Z', isLive: true, stripeSessionId: 'cs_live_x',
    }],
    papers: [
        paper({ setId: 'b', title: 'Math 1 — Set B', attemptCount: 1, latestAttemptId: 'att1',
            latestStatus: 'submitted', latestScore: 26, bestScore: 26,
            latestStartedAt: '2026-09-14T10:00:00Z' }),
        paper({ setId: 'c', title: 'Math 1 — Set C' }),
    ],
    papersCompleted: 1, paidPapersTotal: 2, paidPapersCompleted: 1,
    lastActiveAt: '2026-09-14T11:27:00Z',
}

const INTERNAL: SeasonPassHolder = {
    ...BUYER, studentId: 'me', email: 'me@x.com', name: 'Internal Person', isInternal: true,
    passes: [{ ...BUYER.passes[0], product: 'season_pass_2026', test: null, source: 'comp',
        label: 'Complimentary pass (all tests)', expiresAt: null }],
}

function renderPage(holders: SeasonPassHolder[]) {
    mockQuery.mockReturnValue({ data: holders, isLoading: false, isError: false })
    render(
        <MemoryRouter>
            <SeasonPassesPage />
        </MemoryRouter>
    )
}

describe('SeasonPassesPage', () => {
    beforeEach(() => mockQuery.mockReset())

    it('lists buyers and hides internal accounts by default', () => {
        renderPage([BUYER, INTERNAL])
        expect(screen.getByText('Buyer Name')).toBeInTheDocument()
        expect(screen.getByText('United Kingdom')).toBeInTheDocument()
        expect(screen.queryByText('Internal Person')).not.toBeInTheDocument()

        fireEvent.click(screen.getByLabelText('Show internal accounts'))
        expect(screen.getByText('Internal Person')).toBeInTheDocument()
    })

    it('expands a student into their papers, including ones not started', () => {
        renderPage([BUYER])
        expect(screen.queryByText('Math 1 — Set B')).not.toBeInTheDocument()

        fireEvent.click(screen.getByText('Buyer Name'))
        expect(screen.getByText('Math 1 — Set B')).toBeInTheDocument()
        expect(screen.getByText('Math 1 — Set C')).toBeInTheDocument()
        expect(screen.getByText('Not started')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'View report' })).toBeInTheDocument()

        fireEvent.click(screen.getByLabelText('Only papers they have started'))
        expect(screen.queryByText('Math 1 — Set C')).not.toBeInTheDocument()
    })

    it('says so when nobody holds a pass', () => {
        renderPage([])
        expect(screen.getByText('Nobody holds a Season Pass yet.')).toBeInTheDocument()
    })
})
