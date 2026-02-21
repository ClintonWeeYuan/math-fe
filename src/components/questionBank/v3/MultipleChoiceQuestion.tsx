import { useState } from 'react'
import type { QuestionResponse } from '@/client'
import useGetQuestionOptionQuery from '@/hooks/questionOptions/useGetQuestionOptionsQuery.ts'
import { MemoizedHtmlBlock } from '@/components/questionBank/HtmlBlock.tsx'
import { BlockMath } from 'react-katex'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import type { QuestionStatus } from '@/components/questionBank/v3/types.ts'
import {
    CorrectDialog,
    WrongDialog,
} from '@/components/questionBank/v3/Dialogs.tsx'

type Props = {
    question: QuestionResponse
    setQuestionStatus: (params: {
        questionIndex: number
        status: QuestionStatus
    }) => void
    index: number
}

export function MultipleChoiceQuestion({
    question,
    setQuestionStatus,
    index,
}: Props) {
    const { data: options } = useGetQuestionOptionQuery({
        questionId: question.id,
    })
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [wrongAttempts, setWrongAttempts] = useState(0)
    const [showSuccess, setShowSuccess] = useState(false)
    const [showWrong, setShowWrong] = useState(false)
    const [locked, setLocked] = useState(false)

    if (options === undefined) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-pulse text-gray-500">
                    Loading options...
                </div>
            </div>
        )
    }

    function handleOptionClick(optionId: string, isCorrect: boolean) {
        setSelectedId(optionId)
        if (isCorrect) {
            setQuestionStatus({ questionIndex: index, status: 'correct' })
            setShowSuccess(true)
            setLocked(true)
        } else if (wrongAttempts === 0) {
            setWrongAttempts(1)
            setShowWrong(true)
        } else {
            setQuestionStatus({ questionIndex: index, status: 'incorrect' })
            setWrongAttempts(2)
            setLocked(true)
        }
    }

    function getOptionStyle(option: { id: string; isCorrect?: boolean }) {
        if (!locked && !showWrong && selectedId === null) {
            return 'bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-400'
        }
        if (locked && option.isCorrect) {
            return 'bg-green-50 border-green-500'
        }
        if (option.id === selectedId) {
            return option.isCorrect
                ? 'bg-green-50 border-green-500'
                : 'bg-red-50 border-red-400'
        }
        return 'bg-white border-gray-200 opacity-50'
    }

    function getLabelStyle(option: { id: string; isCorrect?: boolean }) {
        if (!locked && !showWrong && selectedId === null) {
            return 'bg-gray-100 group-hover:bg-blue-100 text-gray-600 group-hover:text-blue-600'
        }
        if (locked && option.isCorrect) {
            return 'bg-green-200 text-green-700'
        }
        if (option.id === selectedId) {
            return option.isCorrect
                ? 'bg-green-200 text-green-700'
                : 'bg-red-200 text-red-700'
        }
        return 'bg-gray-100 text-gray-400'
    }

    const isAnsweredWrong = locked && !showSuccess
    const showAnswer = locked && !!question.answerUrl

    return (
        <>
            <div className="flex gap-6 items-start">
                {/* Left column: question + options */}
                <div className="flex-1 min-w-0 space-y-6">
                    <div className="bg-white rounded-lg shadow-sm p-6 overflow-x-auto no-scrollbar">
                        <MemoizedHtmlBlock
                            src={question.questionUrl}
                            onClick={() => {}}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {options.map((option, index) => (
                            <button
                                key={option.id}
                                disabled={locked || showWrong}
                                onClick={() =>
                                    handleOptionClick(
                                        option.id,
                                        option.isCorrect ?? false
                                    )
                                }
                                className={`group relative border-2 rounded-xl p-6 cursor-pointer text-left transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:cursor-default disabled:transform-none ${getOptionStyle(option)}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-colors ${getLabelStyle(option)}`}
                                    >
                                        {String.fromCharCode(65 + index)}
                                    </div>
                                    <div className="flex-1 text-gray-700 group-hover:text-gray-900 overflow-x-auto no-scrollbar">
                                        <BlockMath math={option.value} />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <AnimatePresence>
                        {isAnsweredWrong && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm"
                            >
                                <span>
                                    The correct answer is highlighted above.
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right column: worked solution */}
                <AnimatePresence>
                    {showAnswer && (
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 40 }}
                            transition={{
                                duration: 0.4,
                                ease: 'easeOut',
                                delay: 0.1,
                            }}
                            className="w-[45%] flex-shrink-0"
                        >
                            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                                    <BookOpen className="w-4 h-4 text-blue-500" />
                                    <h3 className="font-semibold text-gray-700 text-sm">
                                        Worked Solution
                                    </h3>
                                </div>
                                <MemoizedHtmlBlock
                                    src={question.answerUrl}
                                    onClick={() => {}}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <WrongDialog
                showWrong={showWrong}
                setShowWrong={setShowWrong}
                setSelectedId={setSelectedId}
            />

            <CorrectDialog
                showSuccess={showSuccess}
                setShowSuccess={setShowSuccess}
                wrongAttempts={wrongAttempts}
            />
        </>
    )
}
