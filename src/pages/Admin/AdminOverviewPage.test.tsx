import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AdminOverviewPage } from './AdminOverviewPage'

const mockOverview = vi.fn()
vi.mock('@/hooks/useAdminOverviewQuery.ts', () => ({
    default: () => mockOverview(),
}))
vi.mock('@/components/layout/AdminLayout.tsx', () => ({
    AdminLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const BASE = {
    subjects: [
        {
            id: 's1', name: 'SPM Chemistry', slug: 'chemistry', isPublished: true,
            topicCount: 13, publishedQuestions: 577, draftQuestions: 0,
        },
        {
            id: 's2', name: 'History', slug: null, isPublished: false,
            topicCount: 0, publishedQuestions: 0, draftQuestions: 4,
        },
    ],
    diagnosticSetsPublished: 17,
    diagnosticSetsDraft: 3,
    diagnosticQuestionsDraft: 128,
    waitlistSignups: 0,
}

function renderPage(data = BASE, state = {}) {
    mockOverview.mockReturnValue({ data, isLoading: false, isError: false, ...state })
    render(
        <MemoryRouter>
            <AdminOverviewPage />
        </MemoryRouter>
    )
}

describe('AdminOverviewPage', () => {
    beforeEach(() => mockOverview.mockReset())

    it('lists every subject, published or not', () => {
        // An unpublished subject with questions waiting is exactly what an
        // overview should surface; the student catalogue hides it by design.
        renderPage()

        expect(screen.getByText('SPM Chemistry')).toBeInTheDocument()
        expect(screen.getByText('History')).toBeInTheDocument()
        expect(screen.getByText('Not published')).toBeInTheDocument()
    })

    it('surfaces work waiting, with a way to act on it', () => {
        renderPage()

        expect(screen.getByText('128 diagnostic questions in draft')).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: /128 diagnostic questions/ })
        ).toHaveAttribute('href', '/admin/questions')
    })

    it('says nothing about work that does not exist', () => {
        // A dashboard that always reads "0 awaiting review" trains you to stop
        // reading it.
        renderPage({
            ...BASE,
            diagnosticQuestionsDraft: 0,
            diagnosticSetsDraft: 0,
            waitlistSignups: 0,
        })

        expect(screen.queryByText('Waiting on you')).not.toBeInTheDocument()
    })

    it('links a published subject to its student view', () => {
        renderPage()

        expect(
            screen.getByRole('link', { name: 'Student view' })
        ).toHaveAttribute('href', '/spm/chemistry')
    })

    it('offers no student view for a subject with no public page', () => {
        renderPage({ ...BASE, subjects: [BASE.subjects[1]] })

        expect(screen.queryByRole('link', { name: 'Student view' })).not.toBeInTheDocument()
    })

    it('reports a failure rather than showing zeroes as facts', () => {
        renderPage(undefined as never, { isError: true, data: undefined })

        expect(screen.getByText("Couldn't load the overview")).toBeInTheDocument()
    })
})
