import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion'
import type { QuestionResponse } from '@/client'

const mockUseGetQuestionOptionQuery = vi.fn()

vi.mock('@/hooks/questionOptions/useGetQuestionOptionsQuery.ts', () => ({
    default: (...args: unknown[]) => mockUseGetQuestionOptionQuery(...args),
}))

const baseQuestion = {
    id: 'q1',
    questionUrl: '',
    answerUrl: '',
    difficulty: 'EASY',
    createdAt: new Date().toISOString(),
    paper: {},
    paperVariant: {},
    topics: [],
    number: 1,
    marks: 1,
    type: 'multiple_choice',
} as unknown as QuestionResponse

describe('MultipleChoiceQuestion', () => {
    it('shows an error message when the options query fails (regression: previously stuck on "Loading options..." forever)', () => {
        mockUseGetQuestionOptionQuery.mockReturnValue({
            data: undefined,
            isError: true,
        })

        render(
            <MultipleChoiceQuestion
                question={baseQuestion}
                index={0}
                setQuestionStatus={() => {}}
            />
        )

        expect(
            screen.getByText(/failed to load answer options/i)
        ).toBeInTheDocument()
        expect(screen.queryByText(/loading options/i)).not.toBeInTheDocument()
    })

    it('shows the loading state while options are still pending', () => {
        mockUseGetQuestionOptionQuery.mockReturnValue({
            data: undefined,
            isError: false,
        })

        render(
            <MultipleChoiceQuestion
                question={baseQuestion}
                index={0}
                setQuestionStatus={() => {}}
            />
        )

        expect(screen.getByText(/loading options/i)).toBeInTheDocument()
    })
})
