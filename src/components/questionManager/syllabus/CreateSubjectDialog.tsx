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
import useCreateSubjectMutation from '@/hooks/useCreateSubjectMutation.ts'
import { LoadingButton } from '@/components/common/LoadingButton.tsx'
import { toast } from 'sonner'

type Props = {
    syllabusId: string
}

export const CreateSubjectDialog = ({ syllabusId }: Props) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [name, setName] = useState('')
    const [code, setCode] = useState('')
    const { mutateAsync, isPending } = useCreateSubjectMutation({ syllabusId })

    const handleCreateSubject = async () => {
        try {
            await mutateAsync({ name: name.trim(), code: code.trim() })
            setName('')
            setCode('')
            setDialogOpen(false)
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Could not create the subject.'
            )
        }
    }

    return (
        <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
            <Button className="w-full" onClick={() => setDialogOpen(true)}>
                Create Subject
            </Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Subject</DialogTitle>
                    <DialogDescription>
                        A subject holds the topics, papers and questions for one
                        exam subject. Bulk import matches its{' '}
                        <code>questionBank.subject</code> against this name
                        exactly, so name it the way the import files do — e.g.
                        "SPM Chemistry".
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor="subject-name">Name</Label>
                        <Input
                            placeholder="SPM Chemistry"
                            id="subject-name"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="subject-code">Code</Label>
                        <Input
                            placeholder="SPMCHEM"
                            id="subject-code"
                            name="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
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
                        onClick={handleCreateSubject}
                        // Both fields are required by the API; a blank one
                        // would 500 rather than say what's missing.
                        disabled={!name.trim() || !code.trim()}
                    />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
