import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QuizPage } from './Quiz'

const mockUseGetPaginatedQuestionsBySubjectQuery = vi.fn()

vi.mock('@/hooks/useGetPaginatedQuestionsBySubjectQuery.ts', () => ({
    default: (...args: unknown[]) =>
        mockUseGetPaginatedQuestionsBySubjectQuery(...args),
}))

function renderQuizPage() {
    return render(
        <MemoryRouter initialEntries={['/questions/v2/subject-1/quiz']}>
            <Routes>
                <Route
                    path="/questions/v2/:subjectId/quiz"
                    element={<QuizPage />}
                />
            </Routes>
        </MemoryRouter>
    )
}

describe('QuizPage', () => {
    it('shows an error message when the questions query fails (regression: previously rendered "No questions available", indistinguishable from an empty result)', () => {
        mockUseGetPaginatedQuestionsBySubjectQuery.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        })

        renderQuizPage()

        expect(
            screen.getByText(/something went wrong loading questions/i)
        ).toBeInTheDocument()
        expect(screen.queryByText(/no questions available/i)).not.toBeInTheDocument()
    })

    it('shows "No questions available" when the query succeeds with an empty result', () => {
        mockUseGetPaginatedQuestionsBySubjectQuery.mockReturnValue({
            data: { items: [], total: 0, page: 1, size: 10 },
            isLoading: false,
            isError: false,
        })

        renderQuizPage()

        expect(screen.getByText(/no questions available/i)).toBeInTheDocument()
    })
})
