import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QuestionBank } from './QuestionBank'

const mockQuery = vi.fn()
vi.mock('@/hooks/useGetPaginatedQuestionsBySubjectQuery.ts', () => ({
    default: (args: unknown) => {
        mockQuery(args)
        return { data: undefined, isLoading: true, isFetching: false, isError: false }
    },
}))
vi.mock('@/hooks/useGetSubjectQuery.ts', () => ({
    default: () => ({ data: undefined }),
}))
vi.mock('@/hooks/useFiltersFromSearchParams.ts', () => ({
    useFiltersFromSearchParams: () => ({
        topics: [],
        difficulty: [],
        papers: [],
        page: 1,
        setFilterSearchParams: vi.fn(),
    }),
}))

describe('QuestionBank', () => {
    it('never asks for drafts, so an admin sees what a student sees', () => {
        // The reported bug: the catalogue said "5 questions" while the bank
        // behind it showed 67, because being an admin implicitly revealed
        // drafts on every route including this one.
        render(
            <MemoryRouter>
                <QuestionBank subjectId="s1" />
            </MemoryRouter>
        )

        expect(mockQuery.mock.calls[0][0].includeDrafts).toBeUndefined()
    })
})
