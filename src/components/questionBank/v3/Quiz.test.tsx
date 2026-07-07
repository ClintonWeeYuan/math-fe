import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QuizPage } from './Quiz'

const mockUseGetPaginatedQuestionsBySubjectQuery = vi.fn()
const mockUseGetQuestionOptionQuery = vi.fn()
const mockNavigate = vi.fn()

vi.mock('@/hooks/useGetPaginatedQuestionsBySubjectQuery.ts', () => ({
    default: (...args: unknown[]) =>
        mockUseGetPaginatedQuestionsBySubjectQuery(...args),
}))

vi.mock('@/hooks/questionOptions/useGetQuestionOptionsQuery.ts', () => ({
    default: (...args: unknown[]) => mockUseGetQuestionOptionQuery(...args),
}))

vi.mock('react-router-dom', async () => {
    const actual =
        await vi.importActual<typeof import('react-router-dom')>(
            'react-router-dom'
        )
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

function makeQuestion(id: string, topicName: string) {
    return {
        id,
        questionUrl: '',
        answerUrl: '',
        difficulty: 'EASY',
        createdAt: new Date().toISOString(),
        paper: {},
        paperVariant: {},
        topics: [{ id: `topic-${topicName}`, name: topicName, sortOrder: 0 }],
        number: 1,
        marks: 1,
        type: 'multiple_choice',
    }
}

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

    it('shows a summary with score, topic breakdown, and home/practice-more actions after the last question is answered (regression: previously there was no completion screen at all)', () => {
        const questions = [
            makeQuestion('q1', 'Algebra'),
            makeQuestion('q2', 'Geometry'),
        ]
        mockUseGetPaginatedQuestionsBySubjectQuery.mockReturnValue({
            data: { items: questions, total: 2, page: 1, size: 10 },
            isLoading: false,
            isError: false,
        })
        mockUseGetQuestionOptionQuery.mockImplementation(
            ({ questionId }: { questionId: string }) => ({
                data: [
                    { id: `${questionId}-right`, value: 'right', isCorrect: true },
                    { id: `${questionId}-wrong`, value: 'wrong', isCorrect: false },
                ],
                isError: false,
            })
        )

        renderQuizPage()

        // Question 1: answer correctly.
        fireEvent.click(screen.getByText('right'))
        fireEvent.click(screen.getByText('Continue'))
        fireEvent.click(screen.getByText('Next'))

        // Question 2: answer incorrectly (two wrong attempts locks it in).
        fireEvent.click(screen.getByText('wrong'))
        fireEvent.click(screen.getByText('Try Again'))
        fireEvent.click(screen.getByText('wrong'))

        fireEvent.click(screen.getByText('View Results'))

        expect(screen.getByText(/quiz complete/i)).toBeInTheDocument()
        expect(
            screen.getByText(/you got 1 out of 2 questions correct/i)
        ).toBeInTheDocument()
        expect(screen.getByText('Algebra')).toBeInTheDocument()
        expect(screen.getByText(/Geometry \(0\/1\)/)).toBeInTheDocument()

        fireEvent.click(screen.getByText('Home'))
        expect(mockNavigate).toHaveBeenCalledWith('/')

        fireEvent.click(screen.getByText('Practice More'))
        expect(mockNavigate).toHaveBeenCalledWith('/questions/v2/subject-1')
    })
})
