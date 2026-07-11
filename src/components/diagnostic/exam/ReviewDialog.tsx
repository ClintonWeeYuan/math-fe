import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import type { ResponseSummary } from '@/lib/diagnosticResponseSummary.ts'

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    summary: ResponseSummary
    onConfirm: () => void
    isSubmitting: boolean
}

/**
 * The review-before-submit step (§2). The counts come from
 * summarizeResponses over the same shared response-state the navigator
 * colours from, so they can't disagree with the grid. "Keep working"
 * just dismisses; "Submit" runs the manual-submit path (which flushes the
 * event buffer before locking the attempt, since a submitted attempt has
 * no grace window).
 */
export function ReviewDialog({
    open,
    onOpenChange,
    summary,
    onConfirm,
    isSubmitting,
}: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Submit your diagnostic?</DialogTitle>
                    <DialogDescription>
                        Once you submit, you can&apos;t change your answers.
                    </DialogDescription>
                </DialogHeader>

                <dl className="grid grid-cols-3 gap-3 py-2">
                    <div className="flex flex-col items-center rounded-md border p-3">
                        <dt className="text-xs uppercase text-gray-400">Answered</dt>
                        <dd className="text-2xl font-semibold">
                            {summary.answered}
                            <span className="text-base font-normal text-gray-400">
                                /{summary.total}
                            </span>
                        </dd>
                    </div>
                    <div className="flex flex-col items-center rounded-md border p-3">
                        <dt className="text-xs uppercase text-gray-400">Flagged</dt>
                        <dd className="text-2xl font-semibold">{summary.flagged}</dd>
                    </div>
                    <div className="flex flex-col items-center rounded-md border p-3">
                        <dt className="text-xs uppercase text-gray-400">
                            Unanswered
                        </dt>
                        <dd className="text-2xl font-semibold">
                            {summary.unanswered}
                        </dd>
                    </div>
                </dl>

                {summary.unanswered > 0 && (
                    <p className="text-sm text-amber-700">
                        You still have {summary.unanswered} unanswered{' '}
                        {summary.unanswered === 1 ? 'question' : 'questions'}.
                    </p>
                )}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Keep working
                    </Button>
                    <Button type="button" onClick={onConfirm} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting…' : 'Submit'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
