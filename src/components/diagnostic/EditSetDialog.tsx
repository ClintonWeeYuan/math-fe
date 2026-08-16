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
    // Not in the generated client yet, so read through a narrowing. Defaults
    // to 'full', matching the column default.
    const [format, setFormat] = useState<'mini' | 'full'>(
        (set as { format?: 'mini' | 'full' }).format ?? 'full'
    )

    const { mutate: updateSet, isPending } = useUpdateDiagnosticSetMutation({
        setId: set.id,
    })

    const minutes = Number(timeLimit)
    const timeLimitValid = Number.isInteger(minutes) && minutes > 0
    const titleValid = title.trim() !== ''

    function handleSave() {
        if (!titleValid || !timeLimitValid) return
        // `format` is not in the generated UpdateDiagnosticSetBody yet —
        // regenerating the client rewrites all ~1500 lines of it — so the body
        // is asserted once here rather than the field being dropped. The API
        // accepts it; only the local type is behind.
        const body = {
            title: title.trim(),
            // Explicit null is a real "uncategorise" here, not an omission
            // — the backend body distinguishes the two.
            subject,
            timeLimitMinutes: minutes,
            isFree,
            // Always sent, never omitted. A set recreated through this
            // dialog without it silently takes the column default, which
            // is how a published mini turned back into a full paper and
            // would have shown a ten-question Skills Radar.
            format,
        } as Parameters<typeof updateSet>[0]

        updateSet(body, {
            onSuccess: () => onSaved(),
            onError: (err) => toast.error(err.message),
        })
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
                                Must be a whole number of minutes, greater than
                                0.
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="set-format">Format</Label>
                        <select
                            id="set-format"
                            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                            value={format}
                            onChange={(e) =>
                                setFormat(e.target.value as 'mini' | 'full')
                            }
                        >
                            <option value="full">Full paper</option>
                            <option value="mini">Mini test</option>
                        </select>
                        <span className="text-sm text-muted-foreground">
                            {format === 'mini'
                                ? 'No Skills Radar on the report — ten questions cannot resolve every axis.'
                                : 'Full report, including the Skills Radar.'}
                        </span>
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
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
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
