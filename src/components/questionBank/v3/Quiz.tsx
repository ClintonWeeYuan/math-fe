import useGetPaginatedQuestionsBySubjectQuery from '@/hooks/useGetPaginatedQuestionsBySubjectQuery.ts'
import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useFiltersFromSearchParams } from '@/hooks/useFiltersFromSearchParams'
import { LoadingPage } from '@/components/common/FullLoadingPage'

export function QuizPage() {
    const { subjectId } = useParams()
    const [currentIndex, setCurrentIndex] = useState(0)
    const { topics, difficulty, papers, page, setFilterSearchParams } =
        useFiltersFromSearchParams()

    const { data: questions, isLoading } =
        useGetPaginatedQuestionsBySubjectQuery({
            subjectId: subjectId ?? '',
            page: 1,
            papers: [],
            difficulty: [],
            topics: topics ?? [],
            size: 10,
        })

    if (isLoading) {
        return <LoadingPage />
    }

    if (!questions || questions.items.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-gray-500 text-lg">
                    No questions available
                </div>
            </div>
        )
    }
    const currentQuestion = questions.items[currentIndex]
    const totalQuestions = questions.items.length
    const isFirst = currentIndex === 0
    const isLast = currentIndex === totalQuestions - 1

    const goToPrevious = () => {
        if (!isFirst) setCurrentIndex(currentIndex - 1)
    }

    const goToNext = () => {
        if (!isLast) setCurrentIndex(currentIndex + 1)
    }
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header with question counter */}
                <div className="mb-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md">
                        <span className="text-sm font-medium text-gray-600">
                            Question
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                            {currentIndex + 1}
                        </span>
                        <span className="text-sm text-gray-400">of</span>
                        <span className="text-lg font-bold text-gray-700">
                            {totalQuestions}
                        </span>
                    </div>
                </div>

                {/* Question content */}
                <div className="mb-6">
                    <MultipleChoiceQuestion
                        question={currentQuestion}
                        key={currentQuestion.id}
                    />
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between gap-4">
                    <button
                        onClick={goToPrevious}
                        disabled={isFirst}
                        className="group flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                        <span className="font-medium text-gray-700 group-hover:text-gray-900">
                            Previous
                        </span>
                    </button>

                    {/* Progress dots */}
                    <div className="flex gap-2">
                        {questions.items.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${
                                    index === currentIndex
                                        ? 'bg-blue-600 w-8'
                                        : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                                aria-label={`Go to question ${index + 1}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={goToNext}
                        disabled={isLast}
                        className="group flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:hover:bg-blue-600"
                    >
                        <span className="font-medium">Next</span>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}
