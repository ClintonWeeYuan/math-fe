import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useState } from 'react'
import { LoadingButton } from '@/components/common/LoadingButton.tsx'
import { extractErrorMessage } from '@/lib/errorHandling.ts'

import useDeleteQuestionMutation from '@/hooks/useDeleteQuestionMutation.ts'
import type { QuestionResponse } from '@/client'

type Props = {
    question: QuestionResponse
    paperInstanceId: string
}
export const DeleteQuestionDialog = ({ question, paperInstanceId }: Props) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { mutateAsync, isPending, error } = useDeleteQuestionMutation({
        paperInstanceId,
    })

    const handleDeleteQuestion = async () => {
        await mutateAsync(question.id)
        setDialogOpen(false)
    }

    return (
        <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
            <Button onClick={() => setDialogOpen(true)}>Delete</Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Question</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    Are you sure you want to delete question - {question.number}
                    ?
                    {error && (
                        <span className="text-red-600">
                            {extractErrorMessage(error)}
                        </span>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">No</Button>
                    </DialogClose>

                    <LoadingButton
                        isLoading={isPending}
                        text={'Yes'}
                        onClick={handleDeleteQuestion}
                    />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
