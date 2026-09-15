import { useState } from 'react'
import { MessageSquareWarning } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import {
    REPORT_CATEGORIES,
    submitQuestionReport,
    type ReportCategory,
} from '@/lib/questionReportsApi.ts'

type Props = {
    attemptId: string
    questionId: string
    questionNumber: number
    /** Mid-exam, only what can be judged without the answer is offered, and
     *  the wording reassures that the clock is not affected. */
    context: 'exam' | 'review'
}

const MAX_MESSAGE = 1000

/**
 * "Report a problem" — a student telling us a question is wrong.
 *
 * Deliberately small and quick, because mid-exam it is spending the student's
 * time: one tap for the kind of problem, an optional note, send. It never
 * pauses the timer and its reply says nothing about the question.
 *
 * Named "report", never "flag": the exam already has "Flag for review", which
 * is the student's own note to come back to a question. Two flags meaning two
 * different things would be a trap on the one screen where attention is
 * scarcest.
 */
export function ReportQuestionDialog({
    attemptId,
    questionId,
    questionNumber,
    context,
}: Props) {
    const [open, setOpen] = useState(false)
    const [category, setCategory] = useState<ReportCategory | null>(null)
    const [message, setMessage] = useState('')

    const categories = REPORT_CATEGORIES.filter(
        (c) => context === 'review' || !c.afterSubmit
    )

    // Plain state rather than a query mutation: this sits inside the exam
    // screen and the review, and neither needs a cache entry for a one-off
    // send.
    const [isPending, setPending] = useState(false)
    const [data, setData] = useState<string | null>(null)
    const [error, setError] = useState<Error | null>(null)
    const isSuccess = data !== null

    function reset() {
        setPending(false)
        setData(null)
        setError(null)
    }

    async function send(category: ReportCategory) {
        setPending(true)
        setError(null)
        try {
            setData(
                await submitQuestionReport({
                    attemptId,
                    questionId,
                    category,
                    message: message.trim(),
                })
            )
        } catch (err) {
            setError(err as Error)
        } finally {
            setPending(false)
        }
    }

    function changeOpen(next: boolean) {
        setOpen(next)
        if (!next) {
            // A fresh form next time, including for a different question.
            setCategory(null)
            setMessage('')
            reset()
        }
    }

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-500"
                onClick={() => setOpen(true)}
            >
                <MessageSquareWarning className="h-4 w-4" />
                Report a problem
            </Button>
            <Dialog open={open} onOpenChange={changeOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Report a problem with question {questionNumber}
                        </DialogTitle>
                        <DialogDescription>
                            {context === 'exam'
                                ? 'Thanks for letting us know. Your timer keeps running, so this only takes a moment.'
                                : 'Spotted a mistake? Tell us and we will check it.'}
                        </DialogDescription>
                    </DialogHeader>

                    {isSuccess ? (
                        <p className="text-sm text-gray-700" role="status">
                            {data}
                        </p>
                    ) : (
                        <form
                            id={`report-${questionId}`}
                            className="flex flex-col gap-4"
                            onSubmit={(event) => {
                                event.preventDefault()
                                if (!category || isPending) return
                                void send(category)
                            }}
                        >
                            <fieldset className="flex flex-col gap-2">
                                <legend className="mb-1 text-sm font-medium">
                                    What&apos;s wrong?
                                </legend>
                                {categories.map((c) => (
                                    <label
                                        key={c.value}
                                        className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50"
                                    >
                                        <input
                                            type="radio"
                                            name={`category-${questionId}`}
                                            value={c.value}
                                            checked={category === c.value}
                                            onChange={() => setCategory(c.value)}
                                        />
                                        {c.label}
                                    </label>
                                ))}
                            </fieldset>
                            <label className="flex flex-col gap-1 text-sm">
                                <span className="font-medium">
                                    Details <span className="font-normal text-gray-500">(optional)</span>
                                </span>
                                <Textarea
                                    value={message}
                                    maxLength={MAX_MESSAGE}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="For example, which part looks wrong"
                                    rows={3}
                                />
                            </label>
                            {error && (
                                <p className="text-sm text-red-600" role="alert">
                                    {error.message}
                                </p>
                            )}
                        </form>
                    )}

                    <DialogFooter>
                        {isSuccess ? (
                            <Button type="button" onClick={() => changeOpen(false)}>
                                {context === 'exam' ? 'Back to the question' : 'Close'}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => changeOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    form={`report-${questionId}`}
                                    disabled={!category || isPending}
                                >
                                    {isPending ? 'Sending…' : 'Send report'}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
