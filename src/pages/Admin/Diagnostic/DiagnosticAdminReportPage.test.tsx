import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DiagnosticAdminReportPage } from './DiagnosticAdminReportPage'
import { AttemptReportError } from '@/hooks/diagnostic/useGetAttemptReportQuery.ts'
import type { DiagnosticReportResponse } from '@/client'

const mockReport = vi.fn()
const mockPreview = vi.fn()

vi.mock('@/hooks/diagnostic/useAdminAttemptReportQuery.ts', () => ({
    default: () => mockReport(),
}))
vi.mock('@/hooks/diagnostic/useGetSetPreviewQuery.ts', () => ({
    default: () => mockPreview(),
}))
vi.mock('@/components/layout/AdminLayout.tsx', () => ({
    AdminLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
// Stubbed for its props, not its rendering: it owns a react-query hook of its
// own, and this file mounts the page without a QueryClientProvider. Its own
// suite covers what it renders; here we only need to know the page hands it
// the attempt and the admin flag.
vi.mock('@/components/diagnostic/report/ReviewAnswers.tsx', () => ({
    ReviewAnswers: ({ attemptId, admin }: { attemptId: string; admin?: boolean }) => (
        <div data-testid="review">
            review:{attemptId}:{String(admin)}
        </div>
    ),
}))
vi.mock('react-router-dom', async () => {
    const actual =
        await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
    return {
        ...actual,
        useParams: () => ({ attemptId: 'att-1' }),
        useNavigate: () => vi.fn(),
        useLocation: () => ({ state: { studentEmail: 'kid@x.com' } }),
    }
})

function report(): DiagnosticReportResponse {
    return {
        attempt: {
            id: 'att-1', diagnosticSetId: 'set-1', status: 'submitted',
            startedAt: '2026-07-12T00:00:00Z', serverDeadlineAt: '2026-07-12T01:00:00Z',
            submittedAt: '2026-07-12T00:30:00Z', agreedToTerms: true, totalScore: 5,
        },
        subject: 'ESAT Math 2',
        answeredCount: 8,
        skillsRadar: [{ skill: 'S1', score: 5 / 8, attempted: 8, correct: 5 }],
        flaggedNeverRevisited: [],
        perQuestionTime: [],
    }
}

function renderPage() {
    return render(
        <MemoryRouter>
            <DiagnosticAdminReportPage />
        </MemoryRouter>
    )
}

describe('DiagnosticAdminReportPage', () => {
    beforeEach(() => {
        mockReport.mockReset()
        mockPreview.mockReset()
        mockPreview.mockReturnValue({ data: { questionCount: 10 } })
    })

    it('renders the student report with an identifying header', () => {
        mockReport.mockReturnValue({ data: report(), isLoading: false, error: null })
        renderPage()
        expect(screen.getByText('Student report')).toBeInTheDocument()
        // Subtitle carries who + subject; body carries the decoded skill name.
        expect(screen.getByText(/kid@x.com · ESAT Math 2/)).toBeInTheDocument()
        expect(screen.getByText('5/8 correct')).toBeInTheDocument()
        // The decoded skill name appears in both the summary and the radar
        // legend — its presence (not uniqueness) is what matters here.
        expect(
            screen.getAllByText(/Algebraic Manipulation & Fluency/).length
        ).toBeGreaterThan(0)
    })

    it('explains an in-progress attempt (409) instead of erroring', () => {
        mockReport.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new AttemptReportError(409),
        })
        renderPage()
        expect(screen.getByText(/still in progress/i)).toBeInTheDocument()
    })

    it('shows a not-available state on other errors', () => {
        mockReport.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new AttemptReportError(404),
        })
        renderPage()
        expect(screen.getByText(/report not available/i)).toBeInTheDocument()
    })
})


describe('DiagnosticAdminReportPage — worked solutions', () => {
    beforeEach(() => {
        mockReport.mockReset()
        mockPreview.mockReset()
    })

    it('renders the per-question review through the admin route', () => {
        mockReport.mockReturnValue({ data: report(), isLoading: false, error: null })
        mockPreview.mockReturnValue({ data: { questionCount: 27 } })
        render(
            <MemoryRouter>
                <DiagnosticAdminReportPage />
            </MemoryRouter>
        )
        // admin=true matters: the student route is owner-scoped and would 403
        // on someone else's attempt, rendering nothing at all.
        expect(screen.getByTestId('review')).toHaveTextContent('review:att-1:true')
    })

    it('shows no review when the attempt is still in progress', () => {
        mockReport.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new AttemptReportError(409),
        })
        mockPreview.mockReturnValue({ data: undefined })
        render(
            <MemoryRouter>
                <DiagnosticAdminReportPage />
            </MemoryRouter>
        )
        // There is no report yet, so there are no answers to review either.
        expect(screen.queryByTestId('review')).not.toBeInTheDocument()
    })
})
