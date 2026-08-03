import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import {
    QuestionAnswer,
    QuestionContent,
} from '@/components/questionBank/QuestionContent.tsx'
import type { QuestionResponse } from '@/client'
import { Button } from '@/components/ui/button.tsx'
import useUpdateQuestionStatusMutation, {
    type QuestionFilters,
} from '@/hooks/useUpdateQuestionStatusMutation.ts'
import { Badge } from '@/components/ui/badge.tsx'
import { BadgeCheckIcon } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthContext.tsx'

export function AnimatedQuestionCard({
    question,
    questionFilters,
}: {
    question: QuestionResponse
    questionFilters: QuestionFilters
}) {
    const { user } = useAuth()
    const [isFlipped, setIsFlipped] = useState(false)
    const [cardHeight, setCardHeight] = useState<number | 'auto'>(250) // Start with a default height

    // Using useCallback ensures this function reference is stable across re-renders,
    // preventing the useEffect in HtmlBlock from re-running unnecessarily.
    const handleHeightChange = useCallback((height: number) => {
        // Add padding for the card's header and footer
        setCardHeight(height + 100)
    }, [])

    const { mutate: updateQuestionStatus } =
        useUpdateQuestionStatusMutation(questionFilters)

    const difficultyColors: Record<string, string> = {
        easy: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
        medium: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
        hard: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="w-full perspective-1000"
            style={{ height: cardHeight, width: '100%' }}
        >
            <div
                className={`w-full h-full rounded-xl shadow-lg transition-transform duration-700 transform-style-3d`}
                style={{
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
            >
                {/* Front of the card */}
                <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="absolute w-full h-full bg-white dark:bg-gray-800 rounded-xl p-6 flex flex-col justify-between backface-hidden"
                >
                    <div>
                        <div className="flex justify-between items-start">
                            {question.topics.map((topic) => (
                                <Badge className="bg-blue-500 text-xs text-white dark:bg-blue-600">
                                    {topic.name}
                                </Badge>
                            ))}

                            {/*<span className="text-sm font-medium text-indigo-500 dark:text-indigo-400 flex items-center space-x-2 ">*/}
                            {/*    {question.topics.map((topic) => (*/}
                            {/*        <span*/}
                            {/*            key={topic.id}*/}
                            {/*            className="text-xs font-semibold text-[var(--primary-color)] bg-blue-100 px-3 py-1 rounded-full mr-2"*/}
                            {/*        >*/}
                            {/*            {topic.name}*/}
                            {/*        </span>*/}
                            {/*    ))}*/}
                            {/*</span>*/}
                            <div className="flex items-center space-x-2">
                                {question.status === 'COMPLETED' && (
                                    <Badge
                                        variant="secondary"
                                        className="bg-blue-500 text-white dark:bg-blue-600"
                                    >
                                        <BadgeCheckIcon />
                                        Completed
                                    </Badge>
                                )}
                                <Badge
                                    className={`text-xs font-semibold ${difficultyColors[question.difficulty]}`}
                                >
                                    {question.difficulty}
                                </Badge>
                                {/* A question generated against the syllabus
                                    has no past paper to name; it's identified
                                    by its chapter instead. */}
                                {question.paper ? (
                                    <span className="text-sm text-gray-500">
                                        {question.paper.name} (
                                        {question.paperVariant?.year})
                                    </span>
                                ) : (
                                    question.chapter && (
                                        <span className="text-sm text-gray-500">
                                            {question.chapterTitle ??
                                                question.chapter}
                                        </span>
                                    )
                                )}
                            </div>
                        </div>
                        <div className="flex-grow my-2 relative">
                            <QuestionContent
                                question={question}
                                onDimensionChange={handleHeightChange}
                                onClick={() => setIsFlipped(!isFlipped)}
                            />
                        </div>
                    </div>
                    <div className="flex justify-between w-full text-xs text-gray-400 dark:text-gray-500">
                        <span>{question.marks && `[${question.marks}]`}</span>
                        <div className="flex">
                            {user !== null && (
                                <Button
                                    variant="link"
                                    className="text-xs text-gray-400 cursor-pointer pb-6"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        updateQuestionStatus({
                                            questionId: question.id,
                                            isCompleted: !(
                                                question.status === 'COMPLETED'
                                            ),
                                        })
                                    }}
                                >
                                    {question.status === 'COMPLETED'
                                        ? 'Mark as not completed'
                                        : 'Mark as complete'}
                                </Button>
                            )}
                            <Button
                                variant="link"
                                className="text-xs text-gray-400 cursor-pointer pb-6"
                                onClick={() => setIsFlipped(!isFlipped)}
                            >
                                Check answer
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Back of the card */}
                <div
                    className="absolute w-full h-full bg-indigo-400 dark:bg-indigo-700 rounded-xl p-6 flex flex-col justify-center items-center backface-hidden"
                    style={{ transform: 'rotateY(180deg)' }}
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    <div className="flex-grow my-2 relative w-full overflow-y-auto no-scrollbar">
                        <QuestionAnswer
                            question={question}
                            onClick={() => setIsFlipped(!isFlipped)}
                        />
                    </div>
                    <Button
                        variant="link"
                        className="text-xs text-indigo-200 cursor-pointer"
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        View question
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}
