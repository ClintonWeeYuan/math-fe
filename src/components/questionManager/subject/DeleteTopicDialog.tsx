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
import useDeleteTopicMutation from '@/hooks/useDeleteTopicMutation.ts'
import type { BaseTopic } from '@/client'

type Props = {
    topic: BaseTopic
}

export const DeleteTopicDialog = ({ topic }: Props) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { mutateAsync, isPending, error } = useDeleteTopicMutation()

    const handleDeleteTopic = async () => {
        await mutateAsync(topic.id)
        setDialogOpen(false)
    }

    return (
        <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
            <Button onClick={() => setDialogOpen(true)}>Delete</Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Topic</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    Are you sure you want to delete topic - {topic.name}?
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
                        onClick={handleDeleteTopic}
                    />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
