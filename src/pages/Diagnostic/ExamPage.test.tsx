import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ExamPage } from './ExamPage'
import type { DiagnosticAttemptStateResponse } from '@/client'

const mockUseGetAttemptStateQuery = vi.fn()
const mockMutate = vi.fn()
const mockSubmit = vi.fn()

vi.mock('@/hooks/diagnostic/useGetAttemptStateQuery.ts', () => ({
    default: (...args: unknown[]) => mockUseGetAttemptStateQuery(...args),
}))
vi.mock('@/hooks/diagnostic/useUpsertResponseMutation.ts', () => ({
    default: () => ({ mutate: mockMutate }),
}))
vi.mock('@/hooks/diagnostic/useSubmitAttemptMutation.ts', () => ({
    default: () => ({ mutate: mockSubmit }),
}))
vi.mock('react-router-dom', async () => {
    const actual =
        await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
    return {
        ...actual,
        useParams: () => ({ attemptId: 'att-1' }),
        useNavigate: () => vi.fn(),
    }
})

function state(
    over: Partial<DiagnosticAttemptStateResponse> = {}
): DiagnosticAttemptStateResponse {
    return {
        attempt: {
            id: 'att-1',
            diagnosticSetId: 'set-1',
            status: 'in_progress',
            startedAt: '2026-07-11T00:00:00Z',
            serverDeadlineAt: '2026-07-11T01:00:00Z',
            submittedAt: null,
            agreedToTerms: true,
            totalScore: null,
        },
        questions: [
            { id: 'qa', stem: 'First question', options: [{ label: 'A', text: 'a1' }, { label: 'B', text: 'b1' }] },
            { id: 'qb', stem: 'Second question', options: [{ label: 'A', text: 'a2' }, { label: 'B', text: 'b2' }] },
            { id: 'qc', stem: 'Third question', options: [{ label: 'A', text: 'a3' }, { label: 'B', text: 'b3' }] },
        ],
        responses: [
            { questionId: 'qc', questionOrderIndex: 2, selectedOption: 'B', isFlagged: true, viewCount: 1 },
        ],
        ...over,
    }
}

function renderExam() {
    return render(
        <MemoryRouter initialEntries={['/diagnostic/attempts/att-1']}>
            <ExamPage />
        </MemoryRouter>
    )
}

describe('ExamPage', () => {
    beforeEach(() => {
        mockUseGetAttemptStateQuery.mockReset()
        mockMutate.mockReset()
        mockSubmit.mockReset()
    })

    it('renders the question UI for an in_progress attempt', () => {
        mockUseGetAttemptStateQuery.mockReturnValue({ data: state(), isLoading: false, isError: false })
        renderExam()
        expect(screen.getByText('First question')).toBeInTheDocument()
        expect(screen.getByText('Question 1 of 3')).toBeInTheDocument()
    })

    it('renders the always-visible countdown timer during an in_progress attempt', () => {
        mockUseGetAttemptStateQuery.mockReturnValue({ data: state(), isLoading: false, isError: false })
        renderExam()
        expect(screen.getByRole('timer')).toBeInTheDocument()
    })

    it('auto-submits when the timer expires (deadline already past on mount)', () => {
        // A deadline in the past: ExamTimer fires onExpire on mount, which
        // must call the submit mutation exactly once.
        mockUseGetAttemptStateQuery.mockReturnValue({
            data: state({
                attempt: {
                    ...state().attempt,
                    serverDeadlineAt: new Date(Date.now() - 1000).toISOString(),
                },
            }),
            isLoading: false,
            isError: false,
        })
        renderExam()
        expect(mockSubmit).toHaveBeenCalledTimes(1)
    })

    it('renders the closed view (not the question UI) for a timed_out attempt — the status switch', () => {
        mockUseGetAttemptStateQuery.mockReturnValue({
            data: state({ attempt: { ...state().attempt, status: 'timed_out' } }),
            isLoading: false,
            isError: false,
        })
        renderExam()
        expect(screen.getByText(/Time's up/i)).toBeInTheDocument()
        expect(screen.queryByText('First question')).not.toBeInTheDocument()
    })

    it('jumping directly to a question renders its already-saved answer and flag (Q5)', () => {
        mockUseGetAttemptStateQuery.mockReturnValue({ data: state(), isLoading: false, isError: false })
        renderExam()

        // Jump straight to Q3 (skipping 2), which has selectedOption 'B'
        // and isFlagged true saved on it.
        fireEvent.click(screen.getByRole('button', { name: /Question 3/i }))

        expect(screen.getByText('Third question')).toBeInTheDocument()
        // Its saved answer B is rendered as selected, from the shared
        // responses — not a blank render.
        const optionB = screen
            .getAllByRole('radio')
            .find((el) => el.getAttribute('aria-checked') === 'true')
        expect(optionB).toHaveTextContent('B')
        // And its saved flag shows as active (anchored name so it doesn't
        // also match navigator cells whose label contains "flagged").
        expect(screen.getByRole('button', { name: /^Flagged$/ })).toHaveAttribute(
            'aria-pressed',
            'true'
        )
    })

    it('selecting an option fires the upsert with that label', () => {
        mockUseGetAttemptStateQuery.mockReturnValue({ data: state(), isLoading: false, isError: false })
        renderExam()
        fireEvent.click(screen.getByRole('radio', { name: /a1/i }))
        expect(mockMutate).toHaveBeenCalledWith({
            questionId: 'qa',
            body: { selectedOption: 'A' },
        })
    })

    it('does not fire a redundant write when re-selecting the already-selected option', () => {
        mockUseGetAttemptStateQuery.mockReturnValue({ data: state(), isLoading: false, isError: false })
        renderExam()
        // Go to Q3 where B is already selected, click B again.
        fireEvent.click(screen.getByRole('button', { name: /Question 3/i }))
        fireEvent.click(screen.getByRole('radio', { name: /b3/i }))
        expect(mockMutate).not.toHaveBeenCalled()
    })

    it('toggling the flag fires the upsert with the negated flag', () => {
        mockUseGetAttemptStateQuery.mockReturnValue({ data: state(), isLoading: false, isError: false })
        renderExam()
        // Q1 is unflagged -> toggling sends isFlagged true.
        fireEvent.click(screen.getByRole('button', { name: /Flag for review/i }))
        expect(mockMutate).toHaveBeenCalledWith({
            questionId: 'qa',
            body: { isFlagged: true },
        })
    })
})
