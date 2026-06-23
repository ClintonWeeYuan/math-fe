import useGetPaginatedQuestionsBySubjectQuery from '@/hooks/useGetPaginatedQuestionsBySubjectQuery.ts'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useFiltersFromSearchParams } from '@/hooks/useFiltersFromSearchParams'
import { LoadingPage } from '@/components/common/FullLoadingPage'
import type { QuestionStatus } from '@/components/questionBank/v3/types.ts'
import { Progress } from '@/components/questionBank/v3/Progress.tsx'

export function QuizPage() {
    const { subjectId } = useParams()
    const [currentIndex, setCurrentIndex] = useState(0)
    const { topics, difficulty } = useFiltersFromSearchParams()
    const [questionStatus, setQuestionStatus] = useState<QuestionStatus[]>([])

    const { data: questions, isLoading, isError } =
        useGetPaginatedQuestionsBySubjectQuery({
            subjectId: subjectId ?? '',
            page: 1,
            papers: [],
            difficulty,
            topics: topics ?? [],
            size: 10,
        })

    useEffect(() => {
        if (
            questions?.items?.length !== undefined &&
            questions?.items?.length > 0
        ) {
            setQuestionStatus(
                new Array(questions?.items?.length).fill('pending')
            )
        }
    }, [questions?.items?.length])

    if (isLoading) {
        return <LoadingPage />
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-red-500 text-lg">
                    Something went wrong loading questions. Please try again.
                </div>
            </div>
        )
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
    const questionCount = questions.items.length

    const isFirst = currentIndex === 0
    const isLast = currentIndex === questionCount - 1
    const shouldBlock = questionStatus[currentIndex] === 'pending'

    const goToPrevious = () => {
        if (!isFirst) setCurrentIndex(currentIndex - 1)
    }

    const goToNext = () => {
        if (!isLast) setCurrentIndex(currentIndex + 1)
    }

    const correctCount = questionStatus.filter((s) => s === 'correct').length
    const incorrectCount = questionStatus.filter(
        (s) => s === 'incorrect'
    ).length

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <Progress
                    correctCount={correctCount}
                    questionCount={questionCount}
                    incorrectCount={incorrectCount}
                    questions={questions.items}
                    setCurrentIndex={setCurrentIndex}
                    questionStatus={questionStatus}
                    currentIndex={currentIndex}
                />
                {/* Question content */}
                <div className="mb-6">
                    <MultipleChoiceQuestion
                        question={currentQuestion}
                        key={currentQuestion.id}
                        index={currentIndex}
                        setQuestionStatus={({ questionIndex, status }) => {
                            setQuestionStatus((prev) => {
                                const copy = [...prev]
                                copy[questionIndex] = status
                                return copy
                            })
                        }}
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

                    <button
                        onClick={goToNext}
                        disabled={isLast || shouldBlock}
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
