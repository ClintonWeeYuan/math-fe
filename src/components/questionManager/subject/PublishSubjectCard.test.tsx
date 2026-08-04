import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PublishSubjectCard } from './PublishSubjectCard'

const mockMutateAsync = vi.fn()
const mockQuery = vi.fn()
vi.mock('@/hooks/useUpdateSubjectMutation.ts', () => ({
    default: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))
vi.mock('@/hooks/useGetPaginatedQuestionsBySubjectQuery.ts', () => ({
    default: (args: unknown) => mockQuery(args),
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

function setPublishedCount(total: number) {
    mockQuery.mockReturnValue({ data: { total, items: [], page: 1, size: 1 } })
}

function renderCard(isPublished: boolean) {
    render(
        <PublishSubjectCard
            subjectId="s1"
            subjectName="SPM Chemistry"
            isPublished={isPublished}
        />
    )
}

describe('PublishSubjectCard', () => {
    beforeEach(() => {
        mockMutateAsync.mockReset()
        mockQuery.mockReset()
    })

    it('counts published questions, not drafts', () => {
        setPublishedCount(40)
        renderCard(true)
        expect(mockQuery.mock.calls[0][0].status).toBe('published')
    })

    it('explains why a published subject with no published questions is invisible', () => {
        // Publishing it is otherwise a no-op with nothing to show for it, which
        // reads as a broken toggle.
        setPublishedCount(0)
        renderCard(true)

        expect(
            screen.getByText('Published, but not visible')
        ).toBeInTheDocument()
        expect(
            screen.getByText(/students are never sent to an empty subject/)
        ).toBeInTheDocument()
    })

    it('reports the live state once questions are published', () => {
        setPublishedCount(40)
        renderCard(true)

        expect(screen.getByText('Live')).toBeInTheDocument()
        expect(
            screen.getByText(/40 published question\(s\)/)
        ).toBeInTheDocument()
    })

    it('is plainly unpublished when the subject is not published', () => {
        setPublishedCount(40)
        renderCard(false)

        expect(screen.getByText('Not published')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Publish to students' })
        ).toBeInTheDocument()
    })
})
