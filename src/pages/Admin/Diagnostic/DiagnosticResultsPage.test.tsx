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
