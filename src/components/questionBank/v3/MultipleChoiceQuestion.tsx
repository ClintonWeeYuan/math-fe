import { useState } from 'react'
import type { QuestionResponse } from '@/client'
import useGetQuestionOptionQuery from '@/hooks/questionOptions/useGetQuestionOptionsQuery.ts'
import { MemoizedHtmlBlock } from '@/components/questionBank/HtmlBlock.tsx'
import { BlockMath } from 'react-katex'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { SPARKLE_POSITIONS } from '@/components/questionBank/v3/constants.ts'
import type { QuestionStatus } from '@/components/questionBank/v3/types.ts'

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

    function handleWrongDismiss() {
        setShowWrong(false)
        setSelectedId(null)
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
                    <div className="bg-white rounded-lg shadow-sm p-6">
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
                                    <div className="flex-1 text-gray-700 group-hover:text-gray-900">
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

            {/* Wrong answer dialog — first attempt */}
            <Dialog
                open={showWrong}
                onOpenChange={(open) => {
                    if (!open) handleWrongDismiss()
                }}
            >
                <DialogContent
                    showCloseButton={false}
                    className="flex flex-col items-center gap-6 py-12 text-center max-w-sm"
                >
                    <motion.div
                        className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 0.9, 1.05, 1] }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                        <motion.div
                            animate={{ x: [0, -10, 10, -8, 8, -4, 4, 0] }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <X
                                className="w-12 h-12 text-red-500"
                                strokeWidth={2.5}
                            />
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.35 }}
                        className="space-y-1"
                    >
                        <p className="text-2xl font-bold text-gray-800">
                            Not quite!
                        </p>
                        <p className="text-gray-500 text-sm">
                            You have one more try — give it another go!
                        </p>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55, duration: 0.3 }}
                        onClick={handleWrongDismiss}
                        className="px-8 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full transition-colors"
                    >
                        Try Again
                    </motion.button>
                </DialogContent>
            </Dialog>

            {/* Correct answer dialog */}
            <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
                <DialogContent
                    showCloseButton={false}
                    className="flex flex-col items-center gap-6 py-12 text-center max-w-sm overflow-visible"
                >
                    <div className="relative flex items-center justify-center">
                        <AnimatePresence>
                            {showSuccess &&
                                SPARKLE_POSITIONS.map((pos, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-3 h-3 rounded-full"
                                        style={{
                                            backgroundColor: [
                                                '#FBBF24',
                                                '#34D399',
                                                '#60A5FA',
                                                '#F472B6',
                                                '#A78BFA',
                                            ][i % 5],
                                        }}
                                        initial={{
                                            x: 0,
                                            y: 0,
                                            scale: 0,
                                            opacity: 1,
                                        }}
                                        animate={{
                                            x: pos.x,
                                            y: pos.y,
                                            scale: [0, 1.4, 0.8],
                                            opacity: [1, 1, 0],
                                        }}
                                        transition={{
                                            duration: 0.7,
                                            delay: i * 0.04,
                                            ease: 'easeOut',
                                        }}
                                    />
                                ))}
                        </AnimatePresence>

                        <motion.div
                            className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.2, 0.9, 1.05, 1] }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                        >
                            <motion.svg
                                className="w-12 h-12 text-green-500"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2.5}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <motion.path
                                    d="M5 13l4 4L19 7"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: 0.35,
                                        ease: 'easeOut',
                                    }}
                                />
                            </motion.svg>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.35 }}
                        className="space-y-1"
                    >
                        <p className="text-2xl font-bold text-gray-800">
                            Correct!
                        </p>
                        <p className="text-gray-500 text-sm">
                            {wrongAttempts === 0
                                ? 'Great job, keep it up!'
                                : 'You got there in the end!'}
                        </p>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65, duration: 0.3 }}
                        onClick={() => setShowSuccess(false)}
                        className="px-8 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full transition-colors"
                    >
                        Continue
                    </motion.button>
                </DialogContent>
            </Dialog>
        </>
    )
}
