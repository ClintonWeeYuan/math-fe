import {
    Dialog,
    DialogClose,
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
import useCreatePaperVariantMutation from '@/hooks/useCreatePaperVariantMutation.ts'

type Props = {
    syllabusId: string
}
export const CreatePaperVariantDialog = ({ syllabusId }: Props) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { mutateAsync } = useCreatePaperVariantMutation({ syllabusId })
    const [inputValue, setInputValue] = useState('')
    const [yearValue, setYearValue] = useState(2012)
    const handleCreateLevel = async () => {
        await mutateAsync({ name: inputValue, year: yearValue })
        setInputValue('')
        setDialogOpen(false)
    }

    return (
        <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
            <Button className="w-full" onClick={() => setDialogOpen(true)}>
                Create Variant
            </Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Paper Variant</DialogTitle>
                    <DialogDescription>
                        The variants are used to create different instances of
                        each paper. <br />
                        E.g. In SPM, there are two papers: Paper 1 and Paper 2.
                        But every year, there is a different variant of each of
                        the two papers
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor="name-1">Name</Label>
                        <Input
                            placeholder="main"
                            id="name-1"
                            name="name"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <Label htmlFor="year">Year</Label>
                        <Input
                            id="name-1"
                            type="number"
                            name="year"
                            value={yearValue}
                            onChange={(e) =>
                                setYearValue(parseInt(e.target.value))
                            }
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

                    <DialogClose asChild>
                        <Button type="submit" onClick={handleCreateLevel}>
                            Create
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
