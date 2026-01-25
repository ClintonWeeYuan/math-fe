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
import useDeletePaperMutation from '@/hooks/useDeletePaperMutation.ts'
import type { Paper } from '@/client'

type Props = {
    paper: Paper
}
export const DeletePaperDialog = ({ paper }: Props) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { mutateAsync, isPending, error } = useDeletePaperMutation()

    const handleDeletePaper = async () => {
        await mutateAsync(paper.id)
        setDialogOpen(false)
    }

    return (
        <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
            <Button onClick={() => setDialogOpen(true)}>Delete</Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Paper</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    Are you sure you want to delete paper - {paper.name}?
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
                        onClick={handleDeletePaper}
                    />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
