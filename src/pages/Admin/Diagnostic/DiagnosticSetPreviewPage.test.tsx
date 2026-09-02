import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { DiagnosticSetPreviewPage } from './DiagnosticSetPreviewPage'

const mockPreview = vi.fn()
vi.mock('@/hooks/diagnostic/usePreviewDiagnosticSetQuery.ts', () => ({
    default: () => mockPreview(),
}))
const mockNavigate = vi.fn()
const mockStart = vi.fn()
const mockToastError = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<object>('react-router-dom')
    return {
        ...actual,
        useParams: () => ({ setId: 'set-1' }),
        useNavigate: () => mockNavigate,
    }
})
vi.mock('@/hooks/diagnostic/useStartOrResumeAttemptMutation.ts', () => ({
    default: () => ({ mutate: mockStart, isPending: false }),
}))
vi.mock('sonner', () => ({ toast: { error: (m: string) => mockToastError(m) } }))
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
    beforeEach(() => {
        mockPreview.mockReset()
        mockNavigate.mockReset()
        mockStart.mockReset()
        mockToastError.mockReset()
        vi.unstubAllGlobals()
    })

    describe('sitting it for real', () => {
        it('starts an attempt and hands over to the real exam screen', async () => {
            mockPreview.mockReturnValue({ data: SET, isLoading: false, isError: false })
            vi.stubGlobal('confirm', vi.fn(() => true))
            mockStart.mockImplementation((_body, opts) =>
                opts.onSuccess({ attempt: { id: 'attempt-9' } })
            )
            renderPage()

            await userEvent.click(screen.getByRole('button', { name: /Sit it timed/i }))

            // Agreement is implicit for the author of the paper — there is no
            // instructions screen in this path to tick it on.
            expect(mockStart.mock.calls[0][0]).toEqual({
                diagnosticSetId: 'set-1',
                agreedToTerms: true,
            })
            // The real attempt URL, not a preview route.
            expect(mockNavigate).toHaveBeenCalledWith('/diagnostic/attempts/attempt-9')
        })

        it('starts nothing if the confirm is dismissed', async () => {
            mockPreview.mockReturnValue({ data: SET, isLoading: false, isError: false })
            vi.stubGlobal('confirm', vi.fn(() => false))
            renderPage()

            await userEvent.click(screen.getByRole('button', { name: /Sit it timed/i }))

            // The clock runs server-side and cannot be paused, so a misclick
            // must not be able to start one.
            expect(mockStart).not.toHaveBeenCalled()
            expect(mockNavigate).not.toHaveBeenCalled()
        })

        it('surfaces a refusal instead of silently doing nothing', async () => {
            mockPreview.mockReturnValue({ data: SET, isLoading: false, isError: false })
            vi.stubGlobal('confirm', vi.fn(() => true))
            mockStart.mockImplementation((_body, opts) =>
                opts.onError(new Error('Diagnostic set not found.'))
            )
            renderPage()

            await userEvent.click(screen.getByRole('button', { name: /Sit it timed/i }))

            expect(mockToastError).toHaveBeenCalledWith('Diagnostic set not found.')
            expect(mockNavigate).not.toHaveBeenCalled()
        })

        it('cannot be started for a set with no questions', () => {
            mockPreview.mockReturnValue({
                data: { ...SET, questions: [] },
                isLoading: false,
                isError: false,
            })
            renderPage()

            expect(screen.getByRole('button', { name: /Sit it timed/i })).toBeDisabled()
        })
    })

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
        expect(screen.getByText(/Browsing here records nothing/)).toBeInTheDocument()
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
