import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DiagnosticResultsPage } from './DiagnosticResultsPage'
import type { AdminAttemptResultRow } from '@/client'

const mockResults = vi.fn()
const mockDownload = vi.fn()

vi.mock('@/hooks/diagnostic/useAdminResultsQuery.ts', () => ({
    default: () => mockResults(),
}))
vi.mock('@/lib/diagnosticResultsCsv.ts', () => ({
    downloadResultsCsv: (rows: unknown) => mockDownload(rows),
}))
vi.mock('@/components/layout/AdminLayout.tsx', () => ({
    AdminLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
// Stub the drill-in so the page test focuses on the table; surface the
// selected attempt id + open state for the click assertion.
vi.mock('@/components/diagnostic/AttemptDetailDialog.tsx', () => ({
    AttemptDetailDialog: ({ attemptId, open }: { attemptId: string | null; open: boolean }) =>
        open ? <div data-testid="detail-dialog">detail:{attemptId}</div> : null,
}))

function row(over: Partial<AdminAttemptResultRow> = {}): AdminAttemptResultRow {
    return {
        attemptId: 'a1', studentId: 's1', studentEmail: 'one@x.com',
        setId: 'set1', setTitle: 'Set A', subject: 'ESAT Physics',
        status: 'submitted', totalScore: 12, answeredCount: 20, questionCount: 27,
        totalTimeSeconds: 125, startedAt: '2026-07-19T10:00:00Z',
        submittedAt: '2026-07-19T10:30:00Z', ...over,
    }
}

describe('DiagnosticResultsPage', () => {
    beforeEach(() => {
        mockDownload.mockReset()
    })

    it('renders one row per attempt with student, score and completion', () => {
        mockResults.mockReturnValue({
            data: { rows: [row(), row({ attemptId: 'a2', studentEmail: 'two@x.com' })] },
            isLoading: false,
        })
        render(<DiagnosticResultsPage />)
        expect(screen.getByText('one@x.com')).toBeInTheDocument()
        expect(screen.getByText('two@x.com')).toBeInTheDocument()
        // completion answered/question and time mm:ss are rendered.
        expect(screen.getAllByText('20/27').length).toBeGreaterThan(0)
        expect(screen.getAllByText('2:05').length).toBeGreaterThan(0)
    })

    it('opens the drill-in dialog for the clicked attempt', () => {
        mockResults.mockReturnValue({ data: { rows: [row()] }, isLoading: false })
        render(<DiagnosticResultsPage />)
        expect(screen.queryByTestId('detail-dialog')).not.toBeInTheDocument()
        fireEvent.click(screen.getByText('one@x.com'))
        expect(screen.getByTestId('detail-dialog')).toHaveTextContent('detail:a1')
    })

    it('downloads the CSV of the current rows', () => {
        const rows = [row()]
        mockResults.mockReturnValue({ data: { rows }, isLoading: false })
        render(<DiagnosticResultsPage />)
        fireEvent.click(screen.getByRole('button', { name: /Download CSV/i }))
        expect(mockDownload).toHaveBeenCalledWith(rows)
    })

    it('disables CSV and shows an empty state when there are no attempts', () => {
        mockResults.mockReturnValue({ data: { rows: [] }, isLoading: false })
        render(<DiagnosticResultsPage />)
        expect(screen.getByText(/No attempts yet/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Download CSV/i })).toBeDisabled()
    })
})
