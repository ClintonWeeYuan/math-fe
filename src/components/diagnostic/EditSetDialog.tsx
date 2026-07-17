import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import { Combobox } from '@/components/ui/combobox.tsx'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import useUpdateDiagnosticSetMutation from '@/hooks/diagnostic/useUpdateDiagnosticSetMutation.ts'
import {
    DIAGNOSTIC_SUBJECTS,
    UNCATEGORISED_LABEL,
} from '@/lib/diagnosticSubjects.ts'
import type { DiagnosticSetResponse } from '@/client'

type Props = {
    set: DiagnosticSetResponse
    open: boolean
    onOpenChange: (open: boolean) => void
    onSaved: () => void
}

/**
 * Edit a set's metadata — most importantly its subject, which is what the
 * list groups by and what a per-subject student view would key off.
 *
 * Deliberately doesn't touch status: publishing is its own explicit button
 * with its own confirmation, not something to trip over while renaming a
 * set. Nor question membership — a set's questions come from its import,
 * and there's no endpoint to change them (that's the next piece of work).
 */
export function EditSetDialog({ set, open, onOpenChange, onSaved }: Props) {
    const [title, setTitle] = useState(set.title)
    const [subject, setSubject] = useState<string | null>(set.subject ?? null)
    const [timeLimit, setTimeLimit] = useState(String(set.timeLimitMinutes))
    const [isFree, setIsFree] = useState(set.isFree)

    const { mutate: updateSet, isPending } = useUpdateDiagnosticSetMutation({
        setId: set.id,
    })

    const minutes = Number(timeLimit)
    const timeLimitValid = Number.isInteger(minutes) && minutes > 0
    const titleValid = title.trim() !== ''

    function handleSave() {
        if (!titleValid || !timeLimitValid) return
        updateSet(
            {
                title: title.trim(),
                // Explicit null is a real "uncategorise" here, not an omission
                // — the backend body distinguishes the two.
                subject,
                timeLimitMinutes: minutes,
                isFree,
            },
            {
                onSuccess: () => onSaved(),
                onError: () => toast.error('Failed to update set'),
            }
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit set</DialogTitle>
                    <DialogDescription>
                        {set.questionIds.length} questions · created from a bulk
                        import
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="set-title">Title</Label>
                        <Input
                            id="set-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="set-subject">Subject</Label>
                        <Combobox
                            id="set-subject"
                            value={subject}
                            onChange={setSubject}
                            options={DIAGNOSTIC_SUBJECTS}
                            placeholder={UNCATEGORISED_LABEL}
                            clearLabel={UNCATEGORISED_LABEL}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="set-time">Time limit (minutes)</Label>
                        <Input
                            id="set-time"
                            type="number"
                            min={1}
                            value={timeLimit}
                            onChange={(e) => setTimeLimit(e.target.value)}
                        />
                        {!timeLimitValid && (
                            <span className="text-sm text-red-600">
                                Must be a whole number of minutes, greater than 0.
                            </span>
                        )}
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                            checked={isFree}
                            onCheckedChange={(v) => setIsFree(v === true)}
                        />
                        Free tier
                    </label>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isPending || !titleValid || !timeLimitValid}
                    >
                        {isPending ? 'Saving…' : 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
