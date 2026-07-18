import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DiagnosticSetReviewPage } from './DiagnosticSetReviewPage'
import type { DiagnosticQuestionResponse, DiagnosticSetResponse } from '@/client'

const mockGetSet = vi.fn()
const mockListQuestions = vi.fn()
const mockBulkPublish = vi.fn()

vi.mock('@/hooks/diagnostic/useGetDiagnosticSetQuery.ts', () => ({
    default: () => mockGetSet(),
}))
vi.mock('@/hooks/diagnostic/useListDiagnosticQuestionsQuery.ts', () => ({
    default: () => mockListQuestions(),
}))
vi.mock('@/hooks/diagnostic/useBulkSetQuestionStatusMutation.ts', () => ({
    default: () => ({ mutate: mockBulkPublish, isPending: false }),
}))
vi.mock('@/hooks/diagnostic/useUpdateDiagnosticSetMutation.ts', () => ({
    default: () => ({ mutate: vi.fn(), isPending: false }),
}))
vi.mock('@/components/layout/AdminLayout.tsx', () => ({
    AdminLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
vi.mock('@/components/diagnostic/LatexText.tsx', () => ({
    LatexText: ({ text }: { text: string }) => <span>{text}</span>,
}))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
    return { ...actual, useParams: () => ({ setId: 'set-1' }), useNavigate: () => vi.fn() }
})

function set(over: Partial<DiagnosticSetResponse> = {}): DiagnosticSetResponse {
    return {
        id: 'set-1',
        title: 'ESAT Physics — Set A',
        description: null,
        timeLimitMinutes: 40,
        questionIds: ['qb', 'qa'], // deliberately not source order
        isFree: false,
        status: 'draft',
        subject: 'ESAT Physics',
        createdAt: '2026-07-13T00:00:00Z',
        ...over,
    }
}

function q(over: Partial<DiagnosticQuestionResponse>): DiagnosticQuestionResponse {
    return {
        id: 'id',
        topicCode: 'MM1.1',
        coreSkillPrimary: 'S1',
        stem: 'stem',
        options: [
            { label: 'A', text: 'wrong', isCorrect: false },
            { label: 'B', text: 'right', isCorrect: true },
        ],
        correctOption: 'B',
        status: 'published',
        createdAt: '2026-07-13T00:00:00Z',
        ...over,
    }
}

const questions = [
    q({ id: 'qa', topicCode: 'MM1.1', stem: 'first stem' }),
    q({ id: 'qb', topicCode: 'MM2.2', stem: 'second stem', status: 'draft' }),
]

describe('DiagnosticSetReviewPage', () => {
    beforeEach(() => {
        mockGetSet.mockReset()
        mockListQuestions.mockReset()
        mockBulkPublish.mockReset()
        mockListQuestions.mockReturnValue({ data: questions, isLoading: false })
    })

    it('renders the questions in the set order, not the source order', () => {
        mockGetSet.mockReturnValue({ data: set(), isLoading: false })
        render(<MemoryRouter><DiagnosticSetReviewPage /></MemoryRouter>)
        const cards = screen.getAllByText(/stem$/).map((n) => n.textContent)
        // set.questionIds is [qb, qa] -> second stem before first stem.
        expect(cards).toEqual(['second stem', 'first stem'])
    })

    it('links each question to its own edit page', () => {
        mockGetSet.mockReturnValue({ data: set(), isLoading: false })
        render(<MemoryRouter><DiagnosticSetReviewPage /></MemoryRouter>)
        // set.questionIds is [qb, qa] -> Q1 is qb, Q2 is qa. Each Edit link
        // points at that exact question, so an admin can jump straight to
        // (e.g.) Physics Q12 to replace its diagram.
        const editLinks = screen.getAllByRole('link', { name: /edit/i })
        expect(editLinks[0]).toHaveAttribute('href', '/admin/questions/qb')
        expect(editLinks[1]).toHaveAttribute('href', '/admin/questions/qa')
    })

    it('marks the correct option (which the student view hides)', () => {
        mockGetSet.mockReturnValue({ data: set({ questionIds: ['qa'] }), isLoading: false })
        render(<MemoryRouter><DiagnosticSetReviewPage /></MemoryRouter>)
        const correct = screen.getByText('right').closest('li')!
        expect(within(correct).getByText('correct')).toBeInTheDocument()
        // the wrong option is not marked
        expect(within(screen.getByText('wrong').closest('li')!).queryByText('correct')).toBeNull()
    })

    it('offers "Publish all questions" only when some are draft, and bulk-publishes on click', () => {
        mockGetSet.mockReturnValue({ data: set(), isLoading: false }) // qb is draft
        render(<MemoryRouter><DiagnosticSetReviewPage /></MemoryRouter>)
        const btn = screen.getByRole('button', { name: /publish all questions/i })
        fireEvent.click(btn)
        expect(mockBulkPublish.mock.calls[0][0]).toEqual({
            questionIds: ['qb', 'qa'],
            status: 'published',
        })
    })

    it('hides "Publish all questions" when every question is already published', () => {
        mockGetSet.mockReturnValue({
            data: set({ questionIds: ['qa'] }), // qa is published
            isLoading: false,
        })
        render(<MemoryRouter><DiagnosticSetReviewPage /></MemoryRouter>)
        expect(
            screen.queryByRole('button', { name: /publish all questions/i })
        ).not.toBeInTheDocument()
    })
})
