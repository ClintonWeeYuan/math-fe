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
import useDeleteLevelMutation from '@/hooks/useDeleteLevelMutation.ts'
import { LoadingButton } from '@/components/common/LoadingButton.tsx'
import { extractErrorMessage } from '@/lib/errorHandling.ts'
import type { BaseLevel } from '@/client'

type Props = {
    level: BaseLevel
}

export const DeleteLevelDialog = ({ level }: Props) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { mutateAsync, isPending, error } = useDeleteLevelMutation()

    const handleDeleteLevel = async () => {
        await mutateAsync(level.id)
        setDialogOpen(false)
    }

    return (
        <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
            <Button onClick={() => setDialogOpen(true)}>Delete</Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Level</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    Are you sure you want to delete level - {level.name}?
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
                        onClick={handleDeleteLevel}
                    />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
