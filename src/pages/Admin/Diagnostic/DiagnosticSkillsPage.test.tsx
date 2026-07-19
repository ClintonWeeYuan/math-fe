import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DiagnosticSkillsPage } from './DiagnosticSkillsPage'
import type { DiagnosticSetResponse, SkillLabelsResponse } from '@/client'

const mockSets = vi.fn()
const mockLabels = vi.fn()
const mockSave = vi.fn()

vi.mock('@/hooks/diagnostic/useListDiagnosticSetsQuery.ts', () => ({
    default: () => mockSets(),
}))
vi.mock('@/hooks/diagnostic/useSkillLabelsQuery.ts', () => ({
    default: (subject: string | null) => mockLabels(subject),
}))
vi.mock('@/hooks/diagnostic/useUpdateSkillLabelsMutation.ts', () => ({
    default: () => ({ mutate: mockSave, isPending: false }),
}))
vi.mock('@/components/layout/AdminLayout.tsx', () => ({
    AdminLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

function s(id: string, subject: string | null): DiagnosticSetResponse {
    return {
        id, title: id, description: null, timeLimitMinutes: 40, questionIds: [],
        isFree: false, status: 'draft', subject, createdAt: '2026-07-13T00:00:00Z',
    }
}

function labels(subject: string, entries: Array<[string, string]>): SkillLabelsResponse {
    return { subject, labels: entries.map(([skillCode, label]) => ({ skillCode, label })) }
}

const sets = [s('m1', 'ESAT Maths 1'), s('p1', 'ESAT Physics')]

describe('DiagnosticSkillsPage', () => {
    beforeEach(() => {
        mockSets.mockReturnValue({ data: sets, isLoading: false })
        mockSave.mockReset()
        // Stable references per subject, like react-query's structural sharing
        // — a fresh object every render would (correctly) loop the reseed
        // effect, so the mock must mirror the real hook's identity stability.
        const store: Record<string, SkillLabelsResponse> = {
            'ESAT Maths 1': labels('ESAT Maths 1', [['S1', 'Algebra']]),
            'ESAT Physics': labels('ESAT Physics', [['S1', 'Mechanics']]),
        }
        mockLabels.mockImplementation((subject: string | null) => ({
            data: subject ? store[subject] : undefined,
            isLoading: false,
        }))
    })

    it('lists the subjects in use as pickable buttons, first selected', () => {
        render(<DiagnosticSkillsPage />)
        expect(screen.getByRole('button', { name: 'ESAT Maths 1' })).toHaveAttribute(
            'aria-pressed',
            'true'
        )
        expect(screen.getByRole('button', { name: 'ESAT Physics' })).toHaveAttribute(
            'aria-pressed',
            'false'
        )
    })

    it('prefills the seven fields from the saved labels', () => {
        render(<DiagnosticSkillsPage />)
        // All seven codes render an input; S1 is seeded, the rest blank.
        expect(screen.getByLabelText('Label for S1')).toHaveValue('Algebra')
        expect(screen.getByLabelText('Label for S4')).toHaveValue('')
        expect(screen.getAllByRole('textbox')).toHaveLength(7)
    })

    it('saves all seven codes, trimming and clearing blanks', () => {
        render(<DiagnosticSkillsPage />)
        fireEvent.change(screen.getByLabelText('Label for S2'), {
            target: { value: '  Geometry  ' },
        })
        fireEvent.click(screen.getByRole('button', { name: 'Save labels' }))
        const arg = mockSave.mock.calls[0][0]
        expect(arg.subject).toBe('ESAT Maths 1')
        expect(arg.labels).toHaveLength(7)
        expect(arg.labels.find((l: { skillCode: string }) => l.skillCode === 'S1')).toEqual({
            skillCode: 'S1',
            label: 'Algebra',
        })
        expect(arg.labels.find((l: { skillCode: string }) => l.skillCode === 'S2')).toEqual({
            skillCode: 'S2',
            label: 'Geometry', // trimmed
        })
        // Untouched codes go up blank (server clears them).
        expect(arg.labels.find((l: { skillCode: string }) => l.skillCode === 'S7')).toEqual({
            skillCode: 'S7',
            label: '',
        })
    })

    it('switches subject and reloads that subject’s labels', () => {
        render(<DiagnosticSkillsPage />)
        fireEvent.click(screen.getByRole('button', { name: 'ESAT Physics' }))
        expect(screen.getByRole('button', { name: 'ESAT Physics' })).toHaveAttribute(
            'aria-pressed',
            'true'
        )
        expect(screen.getByLabelText('Label for S1')).toHaveValue('Mechanics')
    })

    it('prompts to add a subject when none exist', () => {
        mockSets.mockReturnValue({ data: [], isLoading: false })
        render(<DiagnosticSkillsPage />)
        expect(screen.getByText(/No subjects yet/i)).toBeInTheDocument()
    })
})
