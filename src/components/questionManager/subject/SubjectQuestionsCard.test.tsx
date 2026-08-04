import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SubjectQuestionsCard } from './SubjectQuestionsCard'

const mockQuery = vi.fn()
const mockMutateAsync = vi.fn()
vi.mock('@/hooks/useGetPaginatedQuestionsBySubjectQuery.ts', () => ({
    default: (args: unknown) => mockQuery(args),
}))
vi.mock('@/hooks/useBulkSetQuestionStatusMutation.ts', () => ({
    default: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

function question(id: string, publishStatus: 'draft' | 'published') {
    return {
        id,
        stem: `Stem ${id}`,
        difficulty: 'easy',
        publishStatus,
        chapterTitle: 'Matter and the Atomic Structure',
        topicCode: '2.1.1',
        correctOption: 'A',
        topics: [],
        createdAt: '2026-08-03T00:00:00Z',
        marks: null,
        type: 'multiple_choice',
    }
}

function setItems(items: unknown[], total = items.length) {
    mockQuery.mockReturnValue({
        data: { total, size: 20, page: 1, items },
        isLoading: false,
    })
}

describe('SubjectQuestionsCard', () => {
    beforeEach(() => {
        mockQuery.mockReset()
        mockMutateAsync.mockReset()
        mockMutateAsync.mockResolvedValue({ updatedCount: 1 })
    })

    it('shows drafts and published together by default', () => {
        setItems([question('a', 'draft'), question('b', 'published')])
        render(<SubjectQuestionsCard subjectId="s1" />)

        expect(mockQuery.mock.calls[0][0].status).toBeUndefined()
        expect(screen.getByText('draft')).toBeInTheDocument()
        expect(screen.getByText('published')).toBeInTheDocument()
    })

    it('filters to drafts, which is the review queue', async () => {
        setItems([question('a', 'draft')])
        render(<SubjectQuestionsCard subjectId="s1" />)

        await userEvent.click(screen.getByRole('button', { name: 'Drafts' }))

        const lastCall = mockQuery.mock.calls[mockQuery.mock.calls.length - 1][0]
        expect(lastCall.status).toBe('draft')
        // Back to page 1: page 3 of "all" is rarely page 3 of "drafts", and an
        // empty list there reads as "nothing to review".
        expect(lastCall.page).toBe(1)
    })

    it('publishes a single draft', async () => {
        setItems([question('a', 'draft')])
        render(<SubjectQuestionsCard subjectId="s1" />)

        await userEvent.click(screen.getByRole('button', { name: 'Publish' }))

        expect(mockMutateAsync).toHaveBeenCalledWith({
            questionIds: ['a'],
            status: 'published',
        })
    })

    it('publishes every draft on the page, leaving published ones alone', async () => {
        setItems([
            question('a', 'draft'),
            question('b', 'published'),
            question('c', 'draft'),
        ])
        render(<SubjectQuestionsCard subjectId="s1" />)

        await userEvent.click(
            screen.getByRole('button', { name: /Publish 2 draft/ })
        )

        expect(mockMutateAsync).toHaveBeenCalledWith({
            questionIds: ['a', 'c'],
            status: 'published',
        })
    })

    it('offers no bulk action when nothing is awaiting review', () => {
        setItems([question('b', 'published')])
        render(<SubjectQuestionsCard subjectId="s1" />)

        expect(screen.queryByText(/Publish \d+ draft/)).not.toBeInTheDocument()
    })

    it('can withdraw a published question', async () => {
        setItems([question('b', 'published')])
        render(<SubjectQuestionsCard subjectId="s1" />)

        await userEvent.click(screen.getByRole('button', { name: 'Unpublish' }))

        expect(mockMutateAsync).toHaveBeenCalledWith({
            questionIds: ['b'],
            status: 'draft',
        })
    })
})
