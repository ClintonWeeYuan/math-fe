import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { DiagnosticQuestionsListPage } from './DiagnosticQuestionsListPage'
import type { DiagnosticQuestionResponse, DiagnosticSetResponse } from '@/client'

const mockQuestions = vi.fn()
const mockSets = vi.fn()

vi.mock('@/hooks/diagnostic/useListDiagnosticQuestionsQuery.ts', () => ({
    default: () => mockQuestions(),
}))
vi.mock('@/hooks/diagnostic/useListDiagnosticSetsQuery.ts', () => ({
    default: () => mockSets(),
}))
vi.mock('@/hooks/diagnostic/useDeleteDiagnosticQuestionMutation.ts', () => ({
    default: () => ({ mutate: vi.fn() }),
}))
vi.mock('@/components/diagnostic/BulkImportDialog.tsx', () => ({
    BulkImportDialog: () => null,
}))
vi.mock('@/components/layout/AdminLayout.tsx', () => ({
    AdminLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
    return { ...actual, useNavigate: () => vi.fn() }
})

function q(over: Partial<DiagnosticQuestionResponse>): DiagnosticQuestionResponse {
    return {
        id: 'id',
        topicCode: 'MM1.1',
        coreSkillPrimary: 'S1',
        stem: 'stem',
        options: [{ label: 'A', text: 'x', isCorrect: true }],
        correctOption: 'A',
        status: 'published',
        createdAt: '2026-07-13T00:00:00Z',
        ...over,
    }
}
function s(id: string, title: string, questionIds: string[]): DiagnosticSetResponse {
    return {
        id, title, description: null, timeLimitMinutes: 40, questionIds,
        isFree: false, status: 'published', subject: null, createdAt: '2026-07-13T00:00:00Z',
    }
}

const questions = [
    q({ id: 'a', topicCode: 'MM1.1', stem: 'in physics only' }),
    q({ id: 'b', topicCode: 'MM2.3', stem: 'in both sets', status: 'draft' }),
    q({ id: 'c', topicCode: 'MM3.5', stem: 'orphan question' }),
]
const sets = [s('phys', 'Physics A', ['a', 'b']), s('math', 'Maths A', ['b'])]

describe('DiagnosticQuestionsListPage', () => {
    beforeEach(() => {
        mockQuestions.mockReturnValue({ data: questions, isLoading: false })
        mockSets.mockReturnValue({ data: sets })
    })

    // Rows are identified by topic code (the page shows topic/skill/sets/
    // status, not the stem). Set membership is the reverse lookup.
    it('shows each question’s set membership, and "—" for an orphan', () => {
        render(<DiagnosticQuestionsListPage />)
        const rowA = screen.getByRole('cell', { name: 'MM1.1' }).closest('tr')!
        expect(within(rowA).getByText('Physics A')).toBeInTheDocument()
        const rowB = screen.getByRole('cell', { name: 'MM2.3' }).closest('tr')!
        expect(within(rowB).getByText('Physics A')).toBeInTheDocument()
        expect(within(rowB).getByText('Maths A')).toBeInTheDocument()
        const rowC = screen.getByRole('cell', { name: 'MM3.5' }).closest('tr')!
        expect(within(rowC).getByText('—')).toBeInTheDocument()
    })

    it('shows a filtered count and narrows the rows as you search', () => {
        render(<DiagnosticQuestionsListPage />)
        expect(screen.getByText('3 of 3')).toBeInTheDocument()
        // Search matches question c's stem "orphan question" -> just MM3.5.
        fireEvent.change(screen.getByPlaceholderText(/search stem/i), {
            target: { value: 'orphan' },
        })
        expect(screen.getByText('1 of 3')).toBeInTheDocument()
        expect(screen.getByRole('cell', { name: 'MM3.5' })).toBeInTheDocument()
        expect(screen.queryByRole('cell', { name: 'MM1.1' })).not.toBeInTheDocument()
    })
})
