import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { DiagnosticSubjectsPage } from './DiagnosticSubjectsPage'
import type { DiagnosticSetResponse } from '@/client'

const mockSets = vi.fn()
const mockReassign = vi.fn()

vi.mock('@/hooks/diagnostic/useListDiagnosticSetsQuery.ts', () => ({
    default: () => mockSets(),
}))
vi.mock('@/hooks/diagnostic/useReassignSubjectMutation.ts', () => ({
    default: () => ({ mutate: mockReassign, isPending: false }),
}))
vi.mock('@/components/layout/AdminLayout.tsx', () => ({
    AdminLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

function s(id: string, title: string, subject: string | null): DiagnosticSetResponse {
    return {
        id, title, description: null, timeLimitMinutes: 40, questionIds: [],
        isFree: false, status: 'draft', subject, createdAt: '2026-07-13T00:00:00Z',
    }
}

const sets = [
    s('m1', 'Maths 1 Set A', 'ESAT Maths 1'),
    s('p1', 'Physics Set A', 'ESAT Physics'),
    s('p2', 'Physics Set B', 'ESAT Physics'),
]

describe('DiagnosticSubjectsPage', () => {
    beforeEach(() => {
        mockSets.mockReturnValue({ data: sets, isLoading: false })
        mockReassign.mockReset()
    })

    it('lists the subjects in use with their sets', () => {
        render(<DiagnosticSubjectsPage />)
        const maths = screen.getByText('ESAT Maths 1').closest('tr')!
        expect(within(maths).getByText('Maths 1 Set A')).toBeInTheDocument()
        const physics = screen.getByText('ESAT Physics').closest('tr')!
        expect(within(physics).getByText('Physics Set A')).toBeInTheDocument()
        expect(within(physics).getByText('Physics Set B')).toBeInTheDocument()
    })

    it('renames a subject across all its sets', () => {
        render(<DiagnosticSubjectsPage />)
        const row = screen.getByText('ESAT Maths 1').closest('tr')!
        fireEvent.click(within(row).getByRole('button', { name: 'Rename' }))
        const input = within(row).getByRole('textbox')
        fireEvent.change(input, { target: { value: 'ESAT Maths I' } })
        fireEvent.click(within(row).getByRole('button', { name: 'Save' }))
        expect(mockReassign.mock.calls[0][0]).toEqual({
            setIds: ['m1'],
            subject: 'ESAT Maths I',
        })
    })

    it('deletes a subject by uncategorising its sets (subject: null)', () => {
        vi.stubGlobal('confirm', vi.fn(() => true))
        render(<DiagnosticSubjectsPage />)
        const row = screen.getByText('ESAT Physics').closest('tr')!
        fireEvent.click(within(row).getByRole('button', { name: 'Delete' }))
        expect(mockReassign.mock.calls[0][0]).toEqual({
            setIds: ['p1', 'p2'],
            subject: null,
        })
        vi.unstubAllGlobals()
    })

    it('does not delete when the confirm is declined', () => {
        vi.stubGlobal('confirm', vi.fn(() => false))
        render(<DiagnosticSubjectsPage />)
        const row = screen.getByText('ESAT Physics').closest('tr')!
        fireEvent.click(within(row).getByRole('button', { name: 'Delete' }))
        expect(mockReassign).not.toHaveBeenCalled()
        vi.unstubAllGlobals()
    })
})
