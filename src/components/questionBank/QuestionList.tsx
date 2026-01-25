import { AnimatedQuestionCard } from '@/components/questionBank/AnimatedQuestionCard.tsx'
import { SearchIcon } from 'lucide-react'
import type { QuestionResponse } from '@/client'
import type { QuestionFilters } from '@/hooks/useUpdateQuestionStatusMutation.ts'

type Props = {
    questions: QuestionResponse[]
    questionFilters: QuestionFilters
}

export function QuestionList({ questions, questionFilters }: Props) {
    if (questions.length == 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 rounded-xl text-center h-full">
                <div className="mb-4">
                    <SearchIcon />
                </div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                    No Questions Found
                </h2>
                <p className="text-gray-500 max-w-sm">
                    We couldn't find any questions that match your search. Try
                    adjusting your filters.
                </p>
            </div>
        )
    }
    return questions.map((question) => (
        <AnimatedQuestionCard
            question={question}
            key={question.id}
            questionFilters={questionFilters}
        />
    ))
}
