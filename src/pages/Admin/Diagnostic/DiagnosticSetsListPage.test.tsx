import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { DiagnosticSetsListPage } from './DiagnosticSetsListPage'
import type { DiagnosticSetResponse } from '@/client'

const mockUseListSets = vi.fn()
const mockUpdateMutate = vi.fn()

vi.mock('@/hooks/diagnostic/useListDiagnosticSetsQuery.ts', () => ({
    default: () => mockUseListSets(),
}))
vi.mock('@/hooks/diagnostic/useUpdateDiagnosticSetMutation.ts', () => ({
    default: () => ({ mutate: mockUpdateMutate, isPending: false }),
}))
vi.mock('@/components/layout/AdminLayout.tsx', () => ({
    // The sidebar pulls in auth/router context that isn't what's under test.
    AdminLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual =
        await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
    return { ...actual, useNavigate: () => mockNavigate }
})

function set(over: Partial<DiagnosticSetResponse> = {}): DiagnosticSetResponse {
    return {
        id: 'set-1',
        title: 'ESAT Maths II — Set A',
        description: null,
        timeLimitMinutes: 40,
        questionIds: Array.from({ length: 27 }, (_, i) => `q${i}`),
        isFree: true,
        status: 'draft',
        subject: 'ESAT Maths II',
        createdAt: '2026-07-13T00:00:00Z',
        ...over,
    }
}

describe('DiagnosticSetsListPage', () => {
    beforeEach(() => {
        mockUseListSets.mockReset()
        mockUpdateMutate.mockReset()
    })

    it('tells you where sets come from when there are none', () => {
        mockUseListSets.mockReturnValue({ data: [], isLoading: false })
        render(<DiagnosticSetsListPage />)
        expect(screen.getByText(/no diagnostic sets yet/i)).toBeInTheDocument()
    })

    it('groups sets under their subject, and shows the real set details', () => {
        mockUseListSets.mockReturnValue({ data: [set()], isLoading: false })
        render(<DiagnosticSetsListPage />)

        // Grouped under its subject heading, with the question count and time.
        expect(screen.getByRole('heading', { name: /ESAT Maths II/ })).toBeInTheDocument()
        expect(screen.getByText('ESAT Maths II — Set A')).toBeInTheDocument()
        expect(screen.getByText('27')).toBeInTheDocument()
        expect(screen.getByText('40 min')).toBeInTheDocument()
        expect(screen.getByText('draft')).toBeInTheDocument()
    })

    it('shows an empty known subject rather than hiding the paper', () => {
        mockUseListSets.mockReturnValue({ data: [set()], isLoading: false })
        render(<DiagnosticSetsListPage />)
        // Nothing imported for Physics yet — the heading still appears.
        expect(screen.getByRole('heading', { name: /ESAT Physics/ })).toBeInTheDocument()
        expect(screen.getAllByText(/no sets for this subject yet/i).length).toBeGreaterThan(0)
    })

    it('files an uncategorised set under Uncategorised', () => {
        mockUseListSets.mockReturnValue({
            data: [set({ subject: null, title: 'Legacy set' })],
            isLoading: false,
        })
        render(<DiagnosticSetsListPage />)
        const heading = screen.getByRole('heading', { name: /Uncategorised/ })
        expect(heading).toBeInTheDocument()
        expect(screen.getByText('Legacy set')).toBeInTheDocument()
    })

    it('publishes a draft set from the list', () => {
        mockUseListSets.mockReturnValue({ data: [set({ status: 'draft' })], isLoading: false })
        render(<DiagnosticSetsListPage />)

        fireEvent.click(screen.getByRole('button', { name: 'Publish' }))
        expect(mockUpdateMutate.mock.calls[0][0]).toEqual({ status: 'published' })
    })

    it('opens the edit dialog with the set loaded', () => {
        mockUseListSets.mockReturnValue({ data: [set()], isLoading: false })
        render(<DiagnosticSetsListPage />)

        fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
        const dialog = screen.getByRole('dialog')
        expect(within(dialog).getByLabelText('Title')).toHaveValue('ESAT Maths II — Set A')
        // The subject combobox is pre-filled from the set.
        expect(
            within(dialog).getByRole('combobox', { name: /subject/i })
        ).toHaveTextContent('ESAT Maths II')
    })
})
