import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DiagnosticsCatalogPage } from './DiagnosticsCatalogPage'
import type { PublishedDiagnosticSet } from '@/client'

const mockSets = vi.fn()
const mockNavigate = vi.fn()

vi.mock('@/hooks/diagnostic/useListPublishedSetsQuery.ts', () => ({
    default: () => mockSets(),
}))
vi.mock('@/components/layout/landing/LandingLayout.tsx', () => ({
    LandingLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
vi.mock('react-router-dom', async () => {
    const actual =
        await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
    return { ...actual, useNavigate: () => mockNavigate }
})

function s(id: string, title: string, subject: string): PublishedDiagnosticSet {
    return {
        id, title, subject, description: null,
        timeLimitMinutes: 40, questionCount: 27, isFree: true,
    }
}

function renderPage() {
    return render(
        <MemoryRouter>
            <DiagnosticsCatalogPage />
        </MemoryRouter>
    )
}

describe('DiagnosticsCatalogPage', () => {
    beforeEach(() => {
        mockSets.mockReset()
        mockNavigate.mockReset()
    })

    it('lists published sets grouped by subject with question count + time', () => {
        mockSets.mockReturnValue({
            data: [
                s('p1', 'Physics Set A', 'ESAT Physics'),
                s('m1', 'Maths 1 Set A', 'ESAT Maths 1'),
                s('p2', 'Physics Set B', 'ESAT Physics'),
            ],
            isLoading: false,
        })
        renderPage()
        // Subject headings present, physics grouped together.
        expect(screen.getByText('ESAT Physics')).toBeInTheDocument()
        expect(screen.getByText('ESAT Maths 1')).toBeInTheDocument()
        const physics = screen.getByText('ESAT Physics').closest('section')!
        expect(within(physics).getByText('Physics Set A')).toBeInTheDocument()
        expect(within(physics).getByText('Physics Set B')).toBeInTheDocument()
        expect(screen.getAllByText(/27 questions · 40 min/)[0]).toBeInTheDocument()
    })

    it('starts a diagnostic by routing to its start screen', () => {
        mockSets.mockReturnValue({
            data: [s('p1', 'Physics Set A', 'ESAT Physics')],
            isLoading: false,
        })
        renderPage()
        fireEvent.click(screen.getByRole('button', { name: /Start diagnostic/i }))
        expect(mockNavigate).toHaveBeenCalledWith('/diagnostic/sets/p1')
    })

    it('shows an empty state when nothing is published', () => {
        mockSets.mockReturnValue({ data: [], isLoading: false })
        renderPage()
        expect(screen.getByText(/No diagnostics are available/i)).toBeInTheDocument()
    })
})
