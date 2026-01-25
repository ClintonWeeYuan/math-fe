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
import useDeletePaperVariantMutation from '@/hooks/useDeletePaperVariantMutation.ts'
import type { PaperVariant } from '@/client'

type Props = {
    paperVariant: PaperVariant
}

export const DeletePaperVariantDialog = ({ paperVariant }: Props) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { mutateAsync, isPending, error } = useDeletePaperVariantMutation()

    const handleDeletePaperVariant = async () => {
        await mutateAsync(paperVariant.id)
        setDialogOpen(false)
    }

    return (
        <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
            <Button onClick={() => setDialogOpen(true)}>Delete</Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Paper Variant</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    Are you sure you want to delete paper variant -
                    {paperVariant.name}, {paperVariant.year}?
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
                        onClick={handleDeletePaperVariant}
                    />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
