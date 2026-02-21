import { Dialog, DialogContent } from '@/components/ui/dialog.tsx'
import { AnimatePresence, motion } from 'framer-motion'
import { SPARKLE_POSITIONS } from '@/components/questionBank/v3/constants.ts'
import { X } from 'lucide-react'

type CorrectDialogProps = {
    showSuccess: boolean
    setShowSuccess: (showSuccess: boolean) => void
    wrongAttempts: number
}
export const CorrectDialog = ({
    setShowSuccess,
    showSuccess,
    wrongAttempts,
}: CorrectDialogProps) => {
    return (
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
                    <p className="text-2xl font-bold text-gray-800">Correct!</p>
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
                    className="cursor-pointer px-8 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full transition-colors"
                >
                    Continue
                </motion.button>
            </DialogContent>
        </Dialog>
    )
}

type WrongDialogProps = {
    showWrong: boolean
    setShowWrong: (show: boolean) => void
    setSelectedId: (id: string | null) => void
}
export const WrongDialog = ({
    showWrong,
    setShowWrong,
    setSelectedId,
}: WrongDialogProps) => {
    function handleWrongDismiss() {
        setShowWrong(false)
        setSelectedId(null)
    }

    return (
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
                    className="cursor-pointer px-8 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full transition-colors"
                >
                    Try Again
                </motion.button>
            </DialogContent>
        </Dialog>
    )
}
