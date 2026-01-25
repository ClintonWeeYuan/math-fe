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
import useDeletePaperInstanceMutation from '@/hooks/useDeletePaperInstanceMutation.ts'
import type { PaperInstance } from '@/client'

type Props = {
    paperInstance: PaperInstance
    subjectId: string
}
export const DeletePaperInstanceDialog = ({
    paperInstance,
    subjectId,
}: Props) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { mutateAsync, isPending, error } = useDeletePaperInstanceMutation({
        subjectId,
    })

    const handleDeletePaperInstance = async () => {
        await mutateAsync(paperInstance.id)
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
                    Are you sure you want to delete paper -{' '}
                    {paperInstance.paper.name} ({paperInstance.variant.name} -{' '}
                    {paperInstance.variant.year}) ?
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
                        onClick={handleDeletePaperInstance}
                    />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
