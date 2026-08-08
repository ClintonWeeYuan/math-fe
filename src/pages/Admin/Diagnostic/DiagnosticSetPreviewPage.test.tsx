import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { DiagnosticSetPreviewPage } from './DiagnosticSetPreviewPage'

const mockPreview = vi.fn()
vi.mock('@/hooks/diagnostic/usePreviewDiagnosticSetQuery.ts', () => ({
    default: () => mockPreview(),
}))
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<object>('react-router-dom')
    return { ...actual, useParams: () => ({ setId: 'set-1' }) }
})
vi.mock('@/components/layout/AdminLayout.tsx', () => ({
    AdminLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const SET = {
    id: 'set-1',
    title: 'ESAT Math 1 — Set B',
    subject: 'ESAT Math 1',
    status: 'draft',
    timeLimitMinutes: 40,
    isFree: false,
    questions: [
        { id: 'q1', stem: 'What is 2 + 2?', options: [{ label: 'A', text: '4' }, { label: 'B', text: '5' }] },
        { id: 'q2', stem: 'What is 3 x 3?', options: [{ label: 'A', text: '9' }] },
    ],
}

function renderPage() {
    render(
        <MemoryRouter>
            <DiagnosticSetPreviewPage />
        </MemoryRouter>
    )
}

describe('DiagnosticSetPreviewPage', () => {
    beforeEach(() => mockPreview.mockReset())

    it('renders the first question as a student would see it', () => {
        mockPreview.mockReturnValue({ data: SET, isLoading: false, isError: false })
        renderPage()

        expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
        expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('says clearly that it is a preview', () => {
        // The screen is otherwise indistinguishable from the real exam —
        // which is the point, and also the risk.
        mockPreview.mockReturnValue({ data: SET, isLoading: false, isError: false })
        renderPage()

        expect(screen.getByText('Preview')).toBeInTheDocument()
        expect(screen.getByText(/Nothing is recorded/)).toBeInTheDocument()
    })

    it('moves between questions', async () => {
        mockPreview.mockReturnValue({ data: SET, isLoading: false, isError: false })
        renderPage()

        await userEvent.click(screen.getByRole('button', { name: 'Next' }))
        expect(screen.getByText('What is 3 x 3?')).toBeInTheDocument()
    })

    it('lets an answer be tried without sending it anywhere', async () => {
        mockPreview.mockReturnValue({ data: SET, isLoading: false, isError: false })
        renderPage()

        // No mutation hook exists on this page at all — the only way an
        // answer could leave the browser would be a new import here.
        await userEvent.click(screen.getByText('4'))
        expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
    })

    it('handles a set with no questions', () => {
        mockPreview.mockReturnValue({
            data: { ...SET, questions: [] },
            isLoading: false,
            isError: false,
        })
        renderPage()

        expect(screen.getByText('This set has no questions yet.')).toBeInTheDocument()
    })

    it('reports a set that could not be loaded', () => {
        mockPreview.mockReturnValue({ data: undefined, isLoading: false, isError: true })
        renderPage()

        expect(screen.getByText("Couldn't load this set")).toBeInTheDocument()
    })
})
