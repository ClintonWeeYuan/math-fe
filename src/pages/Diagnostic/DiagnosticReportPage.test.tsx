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
        answeredCount: 2,
        skillsRadar: [
            { skill: 'S1', score: 2 / 3 },
            { skill: 'S2', score: 0 },
            { skill: 'S3', score: null },
            { skill: 'S4', score: null },
            { skill: 'S5', score: null },
            { skill: 'S6', score: null },
            { skill: 'S7', score: null },
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
        // LoadingPage renders; the report content is absent.
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

    it('renders accuracy over attempted separately from completion (never a collapsed X/N)', () => {
        mockUseReport.mockReturnValue({ data: report(), isLoading: false, error: null })
        renderPage()
        // 1 correct of 2 attempted — NOT 1/3 against the full set.
        expect(screen.getByText('1/2 correct')).toBeInTheDocument()
        expect(screen.getByText(/of questions attempted · 2\/3 attempted/i)).toBeInTheDocument()
        expect(screen.queryByText('1/3 correct')).not.toBeInTheDocument()
    })

    it('renders all seven skills, with "not assessed" distinct from a low score', () => {
        mockUseReport.mockReturnValue({ data: report(), isLoading: false, error: null })
        renderPage()
        for (const s of ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7']) {
            expect(screen.getByText(s)).toBeInTheDocument()
        }
        expect(screen.getByText('67%')).toBeInTheDocument() // S1
        expect(screen.getByText('0%')).toBeInTheDocument() // S2 assessed, scored 0
        // S3–S7 are "not assessed" (five of them), not rendered as 0%.
        expect(screen.getAllByText(/not assessed by this paper/i)).toHaveLength(5)
    })

    it('names flagged-never-revisited questions by position', () => {
        mockUseReport.mockReturnValue({ data: report(), isLoading: false, error: null })
        renderPage()
        const flagged = screen.getByText('Flagged & never revisited').closest('section')!
        // qb is order index 1 -> "Question 2".
        expect(within(flagged).getByText('Question 2')).toBeInTheDocument()
    })

    it('lists per-question pacing with durations and revisit counts', () => {
        mockUseReport.mockReturnValue({ data: report(), isLoading: false, error: null })
        renderPage()
        const pacing = screen.getByText('Time per question').closest('section')!
        expect(within(pacing).getByText('0:15')).toBeInTheDocument() // qa 15s
        expect(within(pacing).getByText('1:05')).toBeInTheDocument() // qb 65s
        expect(within(pacing).getByText(/2 visits/)).toBeInTheDocument() // qa viewCount 2
    })

    it('handles a zero-answer attempt without a nonsense 0/0', () => {
        mockUseReport.mockReturnValue({
            data: report({ answeredCount: 0, attempt: { ...report().attempt, totalScore: 0 } }),
            isLoading: false,
            error: null,
        })
        renderPage()
        expect(screen.getByText('No questions answered')).toBeInTheDocument()
        expect(screen.queryByText('0/0 correct')).not.toBeInTheDocument()
    })
})
