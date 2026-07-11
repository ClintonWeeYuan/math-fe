import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
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
const mockRecordEvent = vi.fn()
const mockFlush = vi.fn()
const mockFlushBeforeSubmit = vi.fn(() => Promise.resolve(true))
vi.mock('@/hooks/diagnostic/useEventCapture.ts', () => ({
    default: () => ({
        recordEvent: mockRecordEvent,
        flush: mockFlush,
        flushBeforeSubmit: mockFlushBeforeSubmit,
    }),
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
            // Relative to now so the (un-mocked) timer doesn't expire during
            // tests that aren't about expiry. Tests that DO exercise expiry
            // override serverDeadlineAt with a past timestamp.
            startedAt: new Date(Date.now() - 60_000).toISOString(),
            serverDeadlineAt: new Date(Date.now() + 60 * 60_000).toISOString(),
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
        mockRecordEvent.mockReset()
        mockFlush.mockReset()
        mockFlushBeforeSubmit.mockReset()
        mockFlushBeforeSubmit.mockResolvedValue(true)
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

    it('records an answer_change event when an answer is selected', () => {
        mockUseGetAttemptStateQuery.mockReturnValue({ data: state(), isLoading: false, isError: false })
        renderExam()
        fireEvent.click(screen.getByRole('radio', { name: /a1/i }))
        expect(mockRecordEvent).toHaveBeenCalledWith('qa', 'answer_change')
    })

    it('records flag on flagging and unflag on unflagging', () => {
        // Q3 starts flagged (isFlagged true in the fixture) — go there and
        // toggle it off, expecting an unflag event.
        mockUseGetAttemptStateQuery.mockReturnValue({ data: state(), isLoading: false, isError: false })
        renderExam()

        // Q1 (unflagged) -> flag.
        fireEvent.click(screen.getByRole('button', { name: /Flag for review/i }))
        expect(mockRecordEvent).toHaveBeenCalledWith('qa', 'flag')

        // Jump to Q3 (flagged) -> unflag.
        fireEvent.click(screen.getByRole('button', { name: /Question 3/i }))
        fireEvent.click(screen.getByRole('button', { name: /^Flagged$/ }))
        expect(mockRecordEvent).toHaveBeenCalledWith('qc', 'unflag')
    })

    it('flushes buffered events before auto-submitting at timer expiry', () => {
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
        expect(mockFlush).toHaveBeenCalled()
        expect(mockSubmit).toHaveBeenCalledTimes(1)
    })

    it('opens the review dialog with counts derived from the shared response state', () => {
        // Fixture: 3 questions, one response (qc answered B + flagged) ->
        // answered 1/3, flagged 1, unanswered 2 — the same source the
        // navigator colours from.
        mockUseGetAttemptStateQuery.mockReturnValue({ data: state(), isLoading: false, isError: false })
        renderExam()
        fireEvent.click(screen.getByRole('button', { name: /Finish exam/i }))

        const dialog = screen.getByRole('dialog')
        expect(within(dialog).getByText('Submit your diagnostic?')).toBeInTheDocument()
        expect(within(dialog).getByText('/3')).toBeInTheDocument() // answered X/3
        expect(within(dialog).getByText(/2 unanswered questions/i)).toBeInTheDocument()
    })

    it('confirming submit records the final exit, awaits the blocking flush, then submits', async () => {
        mockUseGetAttemptStateQuery.mockReturnValue({ data: state(), isLoading: false, isError: false })
        renderExam()
        fireEvent.click(screen.getByRole('button', { name: /Finish exam/i }))
        const dialog = screen.getByRole('dialog')
        fireEvent.click(within(dialog).getByRole('button', { name: /^Submit$/ }))

        // Records an exit for the current question (qa) before submitting.
        expect(mockRecordEvent).toHaveBeenCalledWith('qa', 'exit')
        // The blocking pre-submit flush runs, and submit only after it settles.
        expect(mockFlushBeforeSubmit).toHaveBeenCalledTimes(1)
        await waitFor(() => expect(mockSubmit).toHaveBeenCalledTimes(1))
    })

    it('submits even if the pre-submit flush reports failure (never traps the student)', async () => {
        mockFlushBeforeSubmit.mockResolvedValue(false)
        mockUseGetAttemptStateQuery.mockReturnValue({ data: state(), isLoading: false, isError: false })
        renderExam()
        fireEvent.click(screen.getByRole('button', { name: /Finish exam/i }))
        fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /^Submit$/ }))

        await waitFor(() => expect(mockSubmit).toHaveBeenCalledTimes(1))
    })

    it('"Keep working" dismisses the dialog without submitting', () => {
        mockUseGetAttemptStateQuery.mockReturnValue({ data: state(), isLoading: false, isError: false })
        renderExam()
        fireEvent.click(screen.getByRole('button', { name: /Finish exam/i }))
        fireEvent.click(screen.getByRole('button', { name: /Keep working/i }))
        expect(mockSubmit).not.toHaveBeenCalled()
    })
})
