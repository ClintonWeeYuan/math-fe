import { useState } from 'react'
import { toast } from 'sonner'
import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table.tsx'
import useListDiagnosticSetsQuery from '@/hooks/diagnostic/useListDiagnosticSetsQuery.ts'
import { groupSetsBySubject } from '@/lib/diagnosticSubjects.ts'
import { EditSetDialog } from '@/components/diagnostic/EditSetDialog.tsx'
import { SetPublishButton } from '@/components/diagnostic/SetPublishButton.tsx'
import type { DiagnosticSetResponse } from '@/client'

/**
 * Admin screen for diagnostic sets — the counterpart to the questions list.
 * Sets are created by bulk import (each import file is one set); this screen
 * is where they get categorised, published, and their metadata corrected,
 * none of which had any UI before (publishing was a hand-run API call).
 *
 * Grouped by subject rather than a flat list, since the point is running
 * several sets per paper — an empty known-subject heading is deliberate: it
 * says "nothing imported for this paper yet" rather than the paper silently
 * not appearing.
 */
export function DiagnosticSetsListPage() {
    const { data: sets, isLoading } = useListDiagnosticSetsQuery()
    const [editing, setEditing] = useState<DiagnosticSetResponse | null>(null)

    const groups = groupSetsBySubject(sets ?? [])

    return (
        <AdminLayout>
            <div className="mt-8 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Diagnostic Sets</h1>
                    <span className="text-sm text-gray-500">
                        Sets are created by bulk import
                    </span>
                </div>

                {isLoading && <p className="text-gray-500">Loading…</p>}

                {!isLoading && (sets?.length ?? 0) === 0 && (
                    <p className="text-gray-500">
                        No diagnostic sets yet — bulk import a set from the
                        Diagnostic Questions screen.
                    </p>
                )}

                {!isLoading &&
                    (sets?.length ?? 0) > 0 &&
                    groups.map((group) => (
                        <section key={group.subject} className="flex flex-col gap-2">
                            <h2 className="text-lg font-medium">
                                {group.subject}{' '}
                                <span className="text-sm font-normal text-gray-400">
                                    ({group.sets.length})
                                </span>
                            </h2>
                            {group.sets.length === 0 ? (
                                <p className="text-sm text-gray-400">
                                    No sets for this subject yet.
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Questions</TableHead>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {group.sets.map((s) => (
                                            <TableRow key={s.id}>
                                                <TableCell className="font-medium">
                                                    {s.title}
                                                    {s.isFree && (
                                                        <Badge
                                                            variant="outline"
                                                            className="ml-2"
                                                        >
                                                            free
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {s.questionIds.length}
                                                </TableCell>
                                                <TableCell>
                                                    {s.timeLimitMinutes} min
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            s.status === 'published'
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {s.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setEditing(s)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <SetPublishButton set={s} />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </section>
                    ))}
            </div>

            {editing && (
                <EditSetDialog
                    set={editing}
                    open={editing !== null}
                    onOpenChange={(open) => !open && setEditing(null)}
                    onSaved={() => {
                        setEditing(null)
                        toast.success('Set updated')
                    }}
                />
            )}
        </AdminLayout>
    )
}
