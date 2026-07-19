import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DiagnosticReportPage } from './DiagnosticReportPage'
import { AttemptReportError } from '@/hooks/diagnostic/useGetAttemptReportQuery.ts'
import type { DiagnosticReportResponse } from '@/client'

const mockUseReport = vi.fn()
const mockUsePreview = vi.fn()
const mockNavigate = vi.fn()

vi.mock('@/hooks/diagnostic/useGetAttemptReportQuery.ts', async () => {
    const actual = await vi.importActual<
        typeof import('@/hooks/diagnostic/useGetAttemptReportQuery.ts')
    >('@/hooks/diagnostic/useGetAttemptReportQuery.ts')
    return {
        ...actual, // keep the real AttemptReportError
        default: (...args: unknown[]) => mockUseReport(...args),
    }
})
vi.mock('@/hooks/diagnostic/useGetSetPreviewQuery.ts', () => ({
    default: (...args: unknown[]) => mockUsePreview(...args),
}))
vi.mock('react-router-dom', async () => {
    const actual =
        await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
    return {
        ...actual,
        useParams: () => ({ attemptId: 'att-1' }),
        useNavigate: () => mockNavigate,
    }
})

function report(over: Partial<DiagnosticReportResponse> = {}): DiagnosticReportResponse {
    return {
        attempt: {
            id: 'att-1',
            diagnosticSetId: 'set-1',
            status: 'submitted',
            startedAt: '2026-07-12T00:00:00Z',
            serverDeadlineAt: '2026-07-12T01:00:00Z',
            submittedAt: '2026-07-12T00:30:00Z',
            agreedToTerms: true,
            totalScore: 1,
        },
        subject: 'ESAT Math 2',
        answeredCount: 2,
        skillsRadar: [
            { skill: 'S1', score: 5 / 6, attempted: 6, correct: 5 }, // strength 83%
            { skill: 'S3', score: 0.25, attempted: 4, correct: 1 }, // focus 25%
            { skill: 'S5', score: null, attempted: 0, correct: 0 }, // not measured
        ],
        flaggedNeverRevisited: ['qb'],
        perQuestionTime: [
            { questionId: 'qa', questionOrderIndex: 0, totalTimeSeconds: 15, viewCount: 2 },
            { questionId: 'qb', questionOrderIndex: 1, totalTimeSeconds: 65, viewCount: 1 },
        ],
        ...over,
    }
}

function renderPage() {
    return render(
        <MemoryRouter initialEntries={['/diagnostic/attempts/att-1/report']}>
            <DiagnosticReportPage />
        </MemoryRouter>
    )
}

describe('DiagnosticReportPage', () => {
    beforeEach(() => {
        mockUseReport.mockReset()
        mockUsePreview.mockReset()
        mockNavigate.mockReset()
        mockUsePreview.mockReturnValue({ data: { questionCount: 3 } })
    })

    it('shows a loading state while the report is fetching', () => {
        mockUseReport.mockReturnValue({ data: undefined, isLoading: true, error: null })
        renderPage()
        expect(screen.queryByText('Your diagnostic report')).not.toBeInTheDocument()
    })

    it('offers to resume the exam on a 409 (still in progress), not an error', () => {
        mockUseReport.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new AttemptReportError(409),
        })
        renderPage()
        expect(screen.getByText(/isn't finished/i)).toBeInTheDocument()
        screen.getByRole('button', { name: /resume exam/i }).click()
        expect(mockNavigate).toHaveBeenCalledWith('/diagnostic/attempts/att-1')
    })

    it('shows a not-available state on other errors', () => {
        mockUseReport.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new AttemptReportError(403),
        })
        renderPage()
        expect(screen.getByText(/report not available/i)).toBeInTheDocument()
    })

    it('renders accuracy over attempted separately from completion', () => {
        mockUseReport.mockReturnValue({ data: report(), isLoading: false, error: null })
        renderPage()
        expect(screen.getByText('1/2 correct')).toBeInTheDocument()
        expect(screen.getByText(/of questions attempted · 2\/3 attempted/i)).toBeInTheDocument()
        expect(screen.queryByText('1/3 correct')).not.toBeInTheDocument()
    })

    it('writes a plain-English strengths + focus-areas summary with full names', () => {
        mockUseReport.mockReturnValue({ data: report(), isLoading: false, error: null })
        renderPage()
        const summary = screen.getByText('Where you stand').closest('section')!
        // Strength decoded to its full Maths 2 name, with percentage.
        expect(within(summary).getByText(/Algebraic Manipulation & Fluency/)).toBeInTheDocument()
        // Focus area decoded, lowest-first, with denominator.
        const focus = within(summary).getByText(/Graphical & Geometric Reasoning/)
        expect(focus.closest('li')).toHaveTextContent('25%')
        expect(focus.closest('li')).toHaveTextContent('(1 of 4)')
    })

    it('gives a concrete next step for each focus area', () => {
        mockUseReport.mockReturnValue({ data: report(), isLoading: false, error: null })
        renderPage()
        const steps = screen.getByText('Your next steps').closest('section')!
        expect(within(steps).getByText(/Graphical & Geometric Reasoning/)).toBeInTheDocument()
        // The static advice for Maths S3 mentions coordinate geometry.
        expect(within(steps).getByText(/coordinate geometry/i)).toBeInTheDocument()
    })

    it('radar legend keeps "not assessed" distinct from a low score, in full names', () => {
        mockUseReport.mockReturnValue({ data: report(), isLoading: false, error: null })
        renderPage()
        const table = screen.getByRole('table', { name: /skills radar/i })
        // Full subject names as row headers; S5 not measured reads explicitly.
        const s1 = within(table)
            .getByRole('rowheader', { name: /Algebraic Manipulation & Fluency/ })
            .closest('tr')!
        expect(within(s1).getByRole('cell')).toHaveTextContent('83%')
        const s5 = within(table)
            .getByRole('rowheader', { name: /Proportional & Numerical Fluency/ })
            .closest('tr')!
        expect(within(s5).getByRole('cell')).toHaveTextContent('not assessed in this set')
        expect(within(s5).getByRole('cell')).not.toHaveTextContent('0%')
    })

    it('labels the flagged-questions section and names them by position', () => {
        mockUseReport.mockReturnValue({ data: report(), isLoading: false, error: null })
        renderPage()
        const flagged = screen
            .getByText('Questions you flagged to revisit')
            .closest('section')!
        expect(within(flagged).getByText('Question 2')).toBeInTheDocument()
    })

    it('renders the pacing curve, zero-filling the paper to the set size', () => {
        mockUseReport.mockReturnValue({ data: report(), isLoading: false, error: null })
        renderPage()
        const table = screen.getByRole('table', { name: /time per question/i })
        const q1 = within(table).getByRole('rowheader', { name: 'Question 1' }).closest('tr')!
        expect(within(q1).getAllByRole('cell')[0]).toHaveTextContent('0:15')
        const q3 = within(table).getByRole('rowheader', { name: 'Question 3' }).closest('tr')!
        expect(within(q3).getAllByRole('cell')[0]).toHaveTextContent('Not reached')
    })

    it('handles a zero-answer attempt without a nonsense 0/0', () => {
        mockUseReport.mockReturnValue({
            data: report({
                answeredCount: 0,
                attempt: { ...report().attempt, totalScore: 0 },
                skillsRadar: [{ skill: 'S1', score: null, attempted: 0, correct: 0 }],
            }),
            isLoading: false,
            error: null,
        })
        renderPage()
        expect(screen.getByText('No questions answered')).toBeInTheDocument()
        expect(screen.queryByText('0/0 correct')).not.toBeInTheDocument()
    })
})
