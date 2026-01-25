import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Input } from '@/components/ui/input.tsx'
import { useState } from 'react'
import useCreateLevelMutation from '@/hooks/useCreateLevelMutation.ts'
import { LoadingButton } from '@/components/common/LoadingButton.tsx'

type Props = {
    syllabusId: string
}
export const CreateLevelDialog = ({ syllabusId }: Props) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { mutateAsync, isPending } = useCreateLevelMutation({ syllabusId })
    const [inputValue, setInputValue] = useState('')
    const handleCreateLevel = async () => {
        await mutateAsync(inputValue)
        setInputValue('')
        setDialogOpen(false)
    }

    return (
        <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
            <Button className="w-full" onClick={() => setDialogOpen(true)}>
                Create Level
            </Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Level</DialogTitle>
                    <DialogDescription>
                        The levels are primarily used to define topics. <br />
                        E.g. linear equations will have level = Form 4. <br />
                        Note that you do NOT need levels to define a topic. A
                        topic can be standalone without an associated level.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor="name-1">Name</Label>
                        <Input
                            placeholder="Form 4"
                            id="name-1"
                            name="name"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        onClick={() => setDialogOpen(false)}
                        variant="outline"
                    >
                        Cancel
                    </Button>

                    <LoadingButton
                        isLoading={isPending}
                        text={'Create'}
                        onClick={handleCreateLevel}
                    />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
