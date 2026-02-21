import { Check, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { QuestionResponse } from '@/client'
import type { QuestionStatus } from '@/components/questionBank/v3/types.ts'

type Props = {
    correctCount: number
    incorrectCount: number
    questionCount: number
    questions: QuestionResponse[]
    questionStatus: QuestionStatus[]
    currentIndex: number
    setCurrentIndex: (index: number) => void
}
export const Progress = ({
    correctCount,
    incorrectCount,
    questionCount,
    questions,
    questionStatus,
    currentIndex,
    setCurrentIndex,
}: Props) => {
    return (
        <div className="mb-6 bg-white rounded-2xl shadow-md px-6 py-4">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Progress
                </span>
                <div className="flex items-center gap-3 text-sm">
                    {correctCount > 0 && (
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                            <Check className="w-3.5 h-3.5" />
                            {correctCount} correct
                        </span>
                    )}
                    {incorrectCount > 0 && (
                        <span className="flex items-center gap-1 text-red-500 font-medium">
                            <X className="w-3.5 h-3.5" />
                            {incorrectCount} incorrect
                        </span>
                    )}
                    <span className="text-gray-400">
                        {questionCount - correctCount - incorrectCount}{' '}
                        remaining
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                {questions.map((_, i) => {
                    const status = questionStatus[i] ?? 'pending'
                    const isCurrent = i === currentIndex

                    return (
                        <button
                            key={i}
                            onClick={() => {
                                if (questionStatus[i] !== 'pending') {
                                    setCurrentIndex(i)
                                }
                            }}
                            aria-label={`Question ${i + 1}`}
                            className="relative w-9 h-9 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={`${status}-${isCurrent}`}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{
                                        scale: [0.5, 1.25, 0.9, 1.05, 1],
                                        opacity: 1,
                                    }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                    transition={{
                                        duration: 0.35,
                                        ease: 'easeOut',
                                    }}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm
                                                ${status === 'correct' ? 'bg-green-500 text-white' : ''}
                                                ${status === 'incorrect' ? 'bg-red-400 text-white' : ''}
                                                ${status === 'pending' && isCurrent ? 'bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-1' : ''}
                                                ${status === 'pending' && !isCurrent ? 'bg-gray-100 text-gray-400 border-2 border-gray-200' : ''}
                                            `}
                                >
                                    {status === 'correct' && (
                                        <Check
                                            className="w-4 h-4"
                                            strokeWidth={2.5}
                                        />
                                    )}
                                    {status === 'incorrect' && (
                                        <X
                                            className="w-4 h-4"
                                            strokeWidth={2.5}
                                        />
                                    )}
                                    {status === 'pending' && i + 1}
                                </motion.div>
                            </AnimatePresence>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
