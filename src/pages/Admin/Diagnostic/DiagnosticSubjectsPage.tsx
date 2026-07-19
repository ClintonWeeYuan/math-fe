import { useState } from 'react'
import { toast } from 'sonner'
import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table.tsx'
import useListDiagnosticSetsQuery from '@/hooks/diagnostic/useListDiagnosticSetsQuery.ts'
import useReassignSubjectMutation from '@/hooks/diagnostic/useReassignSubjectMutation.ts'
import { subjectsInUse, type SubjectGroup } from '@/lib/diagnosticSubjectsAdmin.ts'

/**
 * Manage the subjects a diagnostic set can belong to. Subjects are free-text
 * labels on sets (not a stored entity), so this lists the ones in use and
 * lets an admin rename one across all its sets — the fix for drift like
 * "ESAT Maths 1" vs "ESAT Maths I" — or delete one (its sets fall back to
 * uncategorised). Both apply as a batch over the affected sets.
 */
export function DiagnosticSubjectsPage() {
    const { data: sets, isLoading } = useListDiagnosticSetsQuery()
    const { mutate: reassign, isPending } = useReassignSubjectMutation()

    const [editing, setEditing] = useState<string | null>(null)
    const [draft, setDraft] = useState('')

    const groups = subjectsInUse(sets ?? [])

    function startRename(group: SubjectGroup) {
        setEditing(group.subject)
        setDraft(group.subject)
    }

    function saveRename(group: SubjectGroup) {
        const to = draft.trim()
        if (to === '' || to === group.subject) {
            setEditing(null)
            return
        }
        reassign(
            { setIds: group.setIds, subject: to },
            {
                onSuccess: ({ ok, failed }) => {
                    setEditing(null)
                    toast.success(
                        `Renamed to “${to}” across ${ok} set${ok === 1 ? '' : 's'}` +
                            (failed > 0 ? `, ${failed} failed` : '')
                    )
                },
                onError: (err) => toast.error(err.message),
            }
        )
    }

    function handleDelete(group: SubjectGroup) {
        const n = group.setIds.length
        if (
            !confirm(
                `Delete the subject “${group.subject}”? Its ${n} set${
                    n === 1 ? '' : 's'
                } will become uncategorised (the sets themselves aren’t deleted).`
            )
        ) {
            return
        }
        reassign(
            { setIds: group.setIds, subject: null },
            {
                onSuccess: ({ ok, failed }) =>
                    toast.success(
                        `Uncategorised ${ok} set${ok === 1 ? '' : 's'}` +
                            (failed > 0 ? `, ${failed} failed` : '')
                    ),
                onError: (err) => toast.error(err.message),
            }
        )
    }

    return (
        <AdminLayout>
            <div className="mt-8 flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Subjects</h1>
                    <p className="text-sm text-gray-500">
                        Renaming a subject updates every set tagged with it.
                    </p>
                </div>

                {isLoading && <p className="text-gray-500">Loading…</p>}

                {!isLoading && groups.length === 0 && (
                    <p className="text-gray-500">
                        No subjects in use yet — assign one to a set from the
                        Diagnostic Sets screen.
                    </p>
                )}

                {!isLoading && groups.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead>Sets</TableHead>
                                <TableHead />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {groups.map((group) => (
                                <TableRow key={group.subject}>
                                    <TableCell className="font-medium">
                                        {editing === group.subject ? (
                                            <Input
                                                autoFocus
                                                value={draft}
                                                onChange={(e) => setDraft(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveRename(group)
                                                    if (e.key === 'Escape') setEditing(null)
                                                }}
                                                className="w-64"
                                            />
                                        ) : (
                                            group.subject
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {group.setTitles.map((title, i) => (
                                                <Badge key={group.setIds[i]} variant="outline">
                                                    {title}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {editing === group.subject ? (
                                            <>
                                                <Button
                                                    size="sm"
                                                    disabled={isPending}
                                                    onClick={() => saveRename(group)}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditing(null)}
                                                >
                                                    Cancel
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => startRename(group)}
                                                >
                                                    Rename
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => handleDelete(group)}
                                                >
                                                    Delete
                                                </Button>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </AdminLayout>
    )
}
