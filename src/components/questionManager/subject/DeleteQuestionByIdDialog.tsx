import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import type { QuestionResponse } from '@/client'
import useDeleteQuestionByIdMutation from '@/hooks/useDeleteQuestionByIdMutation.ts'
import { toast } from 'sonner'

/**
 * Deleting a question is permanent and takes its options and topic links with
 * it, so the question is named back before it goes — a row of identical
 * buttons in a list of 58 is exactly where a stray click happens.
 */
export function DeleteQuestionByIdDialog({
    question,
    open,
    onOpenChange,
}: {
    question: QuestionResponse
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const { mutateAsync, isPending } = useDeleteQuestionByIdMutation()

    async function confirm() {
        try {
            await mutateAsync(question.id)
            toast.success('Question deleted.')
            onOpenChange(false)
        } catch {
            toast.error('Could not delete the question.')
        }
    }

    const label =
        question.stem ??
        `${question.paper?.name ?? 'Question'} Q${question.number ?? '?'}`

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete this question?</DialogTitle>
                    <DialogDescription>
                        This removes the question and its answer options for
                        good. If it came from a chapter file, re-importing that
                        file will bring it back.
                    </DialogDescription>
                </DialogHeader>

                <blockquote className="border-l-2 pl-3 text-sm text-muted-foreground">
                    {label}
                </blockquote>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={confirm}
                        disabled={isPending}
                    >
                        {isPending ? 'Deleting…' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
