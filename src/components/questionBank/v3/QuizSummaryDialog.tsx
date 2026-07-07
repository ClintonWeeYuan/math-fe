import { Dialog, DialogContent } from '@/components/ui/dialog.tsx'
import { motion } from 'framer-motion'
import { Check, RotateCcw, Home, TrendingUp, AlertTriangle } from 'lucide-react'

type TopicStat = {
    name: string
    correct: number
    total: number
}

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    correctCount: number
    questionCount: number
    topicStats: TopicStat[]
    onBackToHome: () => void
    onPracticeMore: () => void
}

export const QuizSummaryDialog = ({
    open,
    onOpenChange,
    correctCount,
    questionCount,
    topicStats,
    onBackToHome,
    onPracticeMore,
}: Props) => {
    const scorePercent =
        questionCount > 0 ? Math.round((correctCount / questionCount) * 100) : 0
    const strengths = topicStats.filter((t) => t.correct === t.total)
    const gaps = topicStats.filter((t) => t.correct < t.total)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="flex flex-col items-center gap-6 py-10 text-center max-w-md"
            >
                <motion.div
                    className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 0.9, 1.05, 1] }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                    <span className="text-2xl font-bold text-blue-600">
                        {scorePercent}%
                    </span>
                </motion.div>

                <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-800">
                        Quiz Complete!
                    </p>
                    <p className="text-gray-500 text-sm">
                        You got {correctCount} out of {questionCount} questions
                        correct
                    </p>
                </div>

                {(strengths.length > 0 || gaps.length > 0) && (
                    <div className="w-full space-y-4 text-left">
                        {strengths.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-green-600 text-sm font-semibold">
                                    <TrendingUp className="w-4 h-4" />
                                    Topics you mastered
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {strengths.map((topic) => (
                                        <span
                                            key={topic.name}
                                            className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-medium"
                                        >
                                            <Check className="w-3 h-3" />
                                            {topic.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {gaps.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-amber-600 text-sm font-semibold">
                                    <AlertTriangle className="w-4 h-4" />
                                    Topics to work on
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {gaps.map((topic) => (
                                        <span
                                            key={topic.name}
                                            className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium"
                                        >
                                            {topic.name} ({topic.correct}/
                                            {topic.total})
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex w-full gap-3">
                    <button
                        onClick={onBackToHome}
                        className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-full transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Home
                    </button>
                    <button
                        onClick={onPracticeMore}
                        className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Practice More
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
