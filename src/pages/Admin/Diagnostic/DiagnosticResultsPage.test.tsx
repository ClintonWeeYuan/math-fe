import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DiagnosticResultsPage } from './DiagnosticResultsPage'
import type { AdminAttemptResultRow } from '@/client'

const mockResults = vi.fn()
const mockDownload = vi.fn()
const mockNavigate = vi.fn()
const mockDelete = vi.fn()

vi.mock('@/hooks/diagnostic/useAdminResultsQuery.ts', () => ({
    default: () => mockResults(),
}))
vi.mock('@/hooks/diagnostic/useBulkDeleteAttemptsMutation.ts', () => ({
    default: () => ({ mutate: mockDelete, isPending: false }),
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('@/lib/diagnosticResultsCsv.ts', () => ({
    downloadResultsCsv: (rows: unknown) => mockDownload(rows),
}))
vi.mock('@/components/layout/AdminLayout.tsx', () => ({
    AdminLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
vi.mock('@/components/diagnostic/AttemptDetailDialog.tsx', () => ({
    AttemptDetailDialog: ({ attemptId, open }: { attemptId: string | null; open: boolean }) =>
        open ? <div data-testid="detail-dialog">detail:{attemptId}</div> : null,
}))
vi.mock('react-router-dom', async () => {
    const actual =
        await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
    return { ...actual, useNavigate: () => mockNavigate }
})

function row(over: Partial<AdminAttemptResultRow> = {}): AdminAttemptResultRow {
    return {
        attemptId: 'a1', studentId: 's1', studentEmail: 'one@x.com',
        setId: 'set1', setTitle: 'Set A', subject: 'ESAT Physics',
        status: 'submitted', totalScore: 12, answeredCount: 20, questionCount: 27,
        totalTimeSeconds: 125, startedAt: '2026-07-19T10:00:00Z',
        submittedAt: '2026-07-19T10:30:00Z', ...over,
    }
}

function renderPage() {
    return render(
        <MemoryRouter>
            <DiagnosticResultsPage />
        </MemoryRouter>
    )
}

describe('DiagnosticResultsPage', () => {
    beforeEach(() => {
        mockDownload.mockReset()
        mockNavigate.mockReset()
        mockDelete.mockReset()
    })

    it('renders one row per attempt with student, score and completion', () => {
        mockResults.mockReturnValue({
            data: { rows: [row(), row({ attemptId: 'a2', studentEmail: 'two@x.com' })] },
            isLoading: false,
        })
        renderPage()
        expect(screen.getByText('one@x.com')).toBeInTheDocument()
        expect(screen.getByText('two@x.com')).toBeInTheDocument()
        expect(screen.getAllByText('20/27').length).toBeGreaterThan(0)
        expect(screen.getAllByText('2:05').length).toBeGreaterThan(0)
    })

    it('leads with the student name and keeps the email underneath', () => {
        mockResults.mockReturnValue({
            data: {
                rows: [
                    row({
                        studentName: 'Aisyah',
                        school: 'SMK Sungai Maong',
                        testSitting: 'october_2026',
                    } as Partial<AdminAttemptResultRow>),
                ],
            },
            isLoading: false,
        })
        renderPage()
        expect(screen.getByText('Aisyah')).toBeInTheDocument()
        // The email stays: it is the identifier an admin searches by, and two
        // students can share a first name.
        expect(screen.getByText('one@x.com')).toBeInTheDocument()
        expect(screen.getByText('SMK Sungai Maong')).toBeInTheDocument()
        expect(screen.getByText('October 2026')).toBeInTheDocument()
    })

    it('falls back to the email for an account with no profile', () => {
        mockResults.mockReturnValue({ data: { rows: [row()] }, isLoading: false })
        renderPage()
        // Not a blank cell where a name would be: the row still has to say who
        // sat the paper.
        expect(screen.getByText('one@x.com')).toBeInTheDocument()
        // School and sitting dash instead. Several cells dash on this row, so
        // this asserts the count is non-zero rather than that it is exactly one.
        expect(screen.getAllByText('—').length).toBeGreaterThan(0)
    })

    it('opens the drill-in dialog for the clicked attempt', () => {
        mockResults.mockReturnValue({ data: { rows: [row()] }, isLoading: false })
        renderPage()
        expect(screen.queryByTestId('detail-dialog')).not.toBeInTheDocument()
        fireEvent.click(screen.getByText('one@x.com'))
        expect(screen.getByTestId('detail-dialog')).toHaveTextContent('detail:a1')
    })

    it('opens the full report for a terminal attempt, passing the email', () => {
        mockResults.mockReturnValue({ data: { rows: [row()] }, isLoading: false })
        renderPage()
        fireEvent.click(screen.getByRole('button', { name: /View report/i }))
        expect(mockNavigate).toHaveBeenCalledWith('/admin/attempts/a1/report', {
            state: { studentEmail: 'one@x.com' },
        })
        // The row click (drill-in) must NOT also fire.
        expect(screen.queryByTestId('detail-dialog')).not.toBeInTheDocument()
    })

    it('hides "View report" for an in-progress attempt (no report yet)', () => {
        mockResults.mockReturnValue({
            data: { rows: [row({ status: 'in_progress', totalScore: null })] },
            isLoading: false,
        })
        renderPage()
        expect(screen.queryByRole('button', { name: /View report/i })).not.toBeInTheDocument()
    })

    it('downloads the CSV of the current rows', () => {
        const rows = [row()]
        mockResults.mockReturnValue({ data: { rows }, isLoading: false })
        renderPage()
        fireEvent.click(screen.getByRole('button', { name: /Download CSV/i }))
        expect(mockDownload).toHaveBeenCalledWith(rows)
    })

    it('disables CSV and shows an empty state when there are no attempts', () => {
        mockResults.mockReturnValue({ data: { rows: [] }, isLoading: false })
        renderPage()
        expect(screen.getByText(/No attempts yet/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Download CSV/i })).toBeDisabled()
    })

    it('multi-select delete: selecting rows shows the bar and deletes on confirm', () => {
        vi.stubGlobal('confirm', vi.fn(() => true))
        mockResults.mockReturnValue({
            data: { rows: [row(), row({ attemptId: 'a2', studentEmail: 'two@x.com' })] },
            isLoading: false,
        })
        renderPage()
        // No bar until something is selected.
        expect(screen.queryByRole('button', { name: /Delete selected/i })).not.toBeInTheDocument()

        fireEvent.click(screen.getByRole('checkbox', { name: /Select result for one@x.com/i }))
        expect(screen.getByText('1 selected')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: /Delete selected/i }))
        expect(mockDelete).toHaveBeenCalledTimes(1)
        expect(mockDelete.mock.calls[0][0]).toEqual(['a1'])
        vi.unstubAllGlobals()
    })

    it('does not delete when the confirm is declined', () => {
        vi.stubGlobal('confirm', vi.fn(() => false))
        mockResults.mockReturnValue({ data: { rows: [row()] }, isLoading: false })
        renderPage()
        fireEvent.click(screen.getByRole('checkbox', { name: /Select result for one@x.com/i }))
        fireEvent.click(screen.getByRole('button', { name: /Delete selected/i }))
        expect(mockDelete).not.toHaveBeenCalled()
        vi.unstubAllGlobals()
    })

    it('select-all header checkbox selects every row', () => {
        mockResults.mockReturnValue({
            data: { rows: [row(), row({ attemptId: 'a2' })] },
            isLoading: false,
        })
        renderPage()
        fireEvent.click(screen.getByRole('checkbox', { name: /Select all results/i }))
        expect(screen.getByText('2 selected')).toBeInTheDocument()
    })
})

/** One ESAT student and one TMUA student, so a split is visible at all. */
function mixedRows(): AdminAttemptResultRow[] {
    return [
        row(),
        row({
            attemptId: 'a2',
            studentId: 's2',
            studentEmail: 'two@x.com',
            setId: 'set2',
            setTitle: 'TMUA Paper 1 - Diagnostic Set A',
            subject: 'TMUA Paper 1',
        }),
    ]
}

describe('DiagnosticResultsPage — ESAT/TMUA split and filters', () => {
    beforeEach(() => {
        mockDownload.mockReset()
        mockNavigate.mockReset()
        mockDelete.mockReset()
    })

    it('shows both test counts at once, so the split reads without clicking', () => {
        mockResults.mockReturnValue({ data: { rows: mixedRows() }, isLoading: false })
        renderPage()
        expect(screen.getByRole('button', { name: /^ESAT/ })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /^TMUA/ })).toBeInTheDocument()
        expect(screen.getByText(/Showing 2 students · 2 attempts/)).toBeInTheDocument()
    })

    it('narrows the table to one test when its tab is clicked', () => {
        mockResults.mockReturnValue({ data: { rows: mixedRows() }, isLoading: false })
        renderPage()
        expect(screen.getByText('two@x.com')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: /^ESAT/ }))
        expect(screen.getByText('one@x.com')).toBeInTheDocument()
        expect(screen.queryByText('two@x.com')).not.toBeInTheDocument()
        expect(
            screen.getByText(/Showing 1 student · 1 attempt \(of 2 students · 2 attempts\)/)
        ).toBeInTheDocument()
    })

    it('offers no tab for a test nobody has sat', () => {
        mockResults.mockReturnValue({ data: { rows: [row()] }, isLoading: false })
        renderPage()
        // An empty TMUA tab would invite a click that shows nothing.
        expect(screen.queryByRole('button', { name: /^TMUA/ })).not.toBeInTheDocument()
    })

    it('warns when a student sat both tests, so the tab counts do not mislead', () => {
        mockResults.mockReturnValue({
            data: {
                rows: [
                    row(),
                    // Same student, other test — counted under each tab.
                    row({ attemptId: 'a2', setId: 'set2', subject: 'TMUA Paper 1' }),
                ],
            },
            isLoading: false,
        })
        renderPage()
        expect(screen.getByText(/1 sat both ESAT and TMUA/)).toBeInTheDocument()
    })

    it('exports only the filtered rows, and says so on the button', () => {
        const rows = mixedRows()
        mockResults.mockReturnValue({ data: { rows }, isLoading: false })
        renderPage()
        fireEvent.click(screen.getByRole('button', { name: /^TMUA/ }))
        expect(
            screen.getByRole('button', { name: /Download CSV \(filtered\)/i })
        ).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: /Download CSV/i }))
        expect(mockDownload).toHaveBeenCalledWith([rows[1]])
    })

    it('clears the selection when a filter changes, so delete cannot reach a hidden row', () => {
        mockResults.mockReturnValue({ data: { rows: mixedRows() }, isLoading: false })
        renderPage()
        fireEvent.click(
            screen.getByRole('checkbox', { name: /Select result for two@x.com/i })
        )
        expect(screen.getByText('1 selected')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: /^ESAT/ }))
        // The TMUA row is now off-screen; leaving it selected would let
        // "Delete selected" take something the admin cannot see.
        expect(screen.queryByText('1 selected')).not.toBeInTheDocument()
    })

    it('distinguishes "no match" from "no attempts" in the empty state', () => {
        mockResults.mockReturnValue({ data: { rows: [row()] }, isLoading: false })
        const { rerender } = renderPage()
        expect(screen.queryByText(/No attempts yet/i)).not.toBeInTheDocument()

        mockResults.mockReturnValue({ data: { rows: [] }, isLoading: false })
        rerender(
            <MemoryRouter>
                <DiagnosticResultsPage />
            </MemoryRouter>
        )
        expect(screen.getByText(/No attempts yet/i)).toBeInTheDocument()
    })

    it('hides the filter bar entirely when there is nothing to filter', () => {
        mockResults.mockReturnValue({ data: { rows: [] }, isLoading: false })
        renderPage()
        expect(screen.queryByRole('button', { name: /^ESAT/ })).not.toBeInTheDocument()
        expect(screen.queryByLabelText(/Filter by subject/i)).not.toBeInTheDocument()
    })
})
