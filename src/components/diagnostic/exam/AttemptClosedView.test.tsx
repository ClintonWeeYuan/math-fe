import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AttemptClosedView } from './AttemptClosedView'
import type { DiagnosticAttemptResponse } from '@/client'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual =
        await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
    return { ...actual, useNavigate: () => mockNavigate }
})

function attempt(over: Partial<DiagnosticAttemptResponse> = {}): DiagnosticAttemptResponse {
    return {
        id: 'att-1',
        diagnosticSetId: 'set-1',
        status: 'submitted',
        startedAt: '2026-07-12T00:00:00Z',
        serverDeadlineAt: '2026-07-12T01:00:00Z',
        submittedAt: '2026-07-12T00:30:00Z',
        agreedToTerms: true,
        totalScore: null,
        ...over,
    }
}

function renderView(a: DiagnosticAttemptResponse) {
    return render(
        <MemoryRouter>
            <AttemptClosedView attempt={a} />
        </MemoryRouter>
    )
}

describe('AttemptClosedView', () => {
    beforeEach(() => mockNavigate.mockReset())

    it('sends the student to their report from the CTA', () => {
        renderView(attempt())
        fireEvent.click(screen.getByRole('button', { name: /view your report/i }))
        expect(mockNavigate).toHaveBeenCalledWith('/diagnostic/attempts/att-1/report')
    })

    it('shows the timed-out heading for a timed_out attempt', () => {
        renderView(attempt({ status: 'timed_out' }))
        expect(screen.getByText(/time's up/i)).toBeInTheDocument()
        expect(screen.getByText(/your report is ready/i)).toBeInTheDocument()
    })
})
