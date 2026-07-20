import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table.tsx'
import useAdminResultsQuery from '@/hooks/diagnostic/useAdminResultsQuery.ts'
import useBulkDeleteAttemptsMutation from '@/hooks/diagnostic/useBulkDeleteAttemptsMutation.ts'
import { AttemptDetailDialog } from '@/components/diagnostic/AttemptDetailDialog.tsx'
import { downloadResultsCsv } from '@/lib/diagnosticResultsCsv.ts'
import type { AdminAttemptResultRow } from '@/client'

function fmtTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, '0')}`
}

function fmtDate(iso: string | null | undefined): string {
    if (!iso) return '—'
    return new Date(iso).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    })
}

function statusVariant(status: AdminAttemptResultRow['status']) {
    if (status === 'submitted') return 'default'
    if (status === 'timed_out') return 'secondary'
    return 'outline' // in_progress / abandoned
}

/**
 * Collect the results of everyone who has attempted a diagnostic: one row per
 * attempt (student, set, score, completion, time), a CSV export, a click-
 * through drill-in, and multi-select delete of selected results.
 */
export function DiagnosticResultsPage() {
    const navigate = useNavigate()
    const { data, isLoading } = useAdminResultsQuery()
    const rows = data?.rows ?? []

    const [openAttempt, setOpenAttempt] = useState<string | null>(null)
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const { mutate: bulkDelete, isPending: isDeleting } =
        useBulkDeleteAttemptsMutation()

    const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.attemptId))

    function toggleOne(id: string, on: boolean) {
        setSelected((prev) => {
            const next = new Set(prev)
            if (on) next.add(id)
            else next.delete(id)
            return next
        })
    }
    function toggleAll(on: boolean) {
        setSelected(on ? new Set(rows.map((r) => r.attemptId)) : new Set())
    }

    function handleBulkDelete() {
        const ids = [...selected]
        if (ids.length === 0) return
        if (
            !confirm(
                `Delete ${ids.length} result${ids.length === 1 ? '' : 's'}? ` +
                    `This permanently removes the attempt${
                        ids.length === 1 ? '' : 's'
                    } and all recorded answers and timing. This can’t be undone.`
            )
        ) {
            return
        }
        bulkDelete(ids, {
            onSuccess: (res) => {
                toast.success(
                    `Deleted ${res?.deletedCount ?? ids.length} result${
                        (res?.deletedCount ?? ids.length) === 1 ? '' : 's'
                    }`
                )
                setSelected(new Set())
            },
            onError: (err) => toast.error(err.message),
        })
    }

    return (
        <AdminLayout>
            <div className="mt-8 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Results</h1>
                        <p className="text-sm text-gray-500">
                            Every attempt across all students. Click a row for the
                            per-question breakdown, or open the student&apos;s full
                            report.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        disabled={rows.length === 0}
                        onClick={() => downloadResultsCsv(rows)}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Download CSV
                    </Button>
                </div>

                {/* Bulk action bar — appears once results are selected. */}
                {selected.size > 0 && (
                    <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
                        <span className="text-sm font-medium">
                            {selected.size} selected
                        </span>
                        <Button
                            variant="destructive"
                            size="sm"
                            disabled={isDeleting}
                            onClick={handleBulkDelete}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isDeleting ? 'Deleting…' : 'Delete selected'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelected(new Set())}
                        >
                            Clear
                        </Button>
                    </div>
                )}

                {isLoading && <p className="text-gray-500">Loading…</p>}

                {!isLoading && rows.length === 0 && (
                    <p className="text-gray-500">
                        No attempts yet — results appear here once a student sits a
                        diagnostic.
                    </p>
                )}

                {!isLoading && rows.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-8">
                                    <Checkbox
                                        aria-label="Select all results"
                                        checked={allSelected}
                                        onCheckedChange={(v) => toggleAll(v === true)}
                                    />
                                </TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Set</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Score</TableHead>
                                <TableHead className="text-right">Answered</TableHead>
                                <TableHead className="text-right">Time</TableHead>
                                <TableHead>Started</TableHead>
                                <TableHead />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((r) => (
                                <TableRow
                                    key={r.attemptId}
                                    className="cursor-pointer"
                                    data-state={selected.has(r.attemptId) ? 'selected' : undefined}
                                    onClick={() => setOpenAttempt(r.attemptId)}
                                >
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            aria-label={`Select result for ${
                                                r.studentEmail ?? 'student'
                                            }`}
                                            checked={selected.has(r.attemptId)}
                                            onCheckedChange={(v) =>
                                                toggleOne(r.attemptId, v === true)
                                            }
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {r.studentEmail ?? '—'}
                                    </TableCell>
                                    <TableCell>{r.setTitle ?? '—'}</TableCell>
                                    <TableCell>{r.subject ?? '—'}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariant(r.status)}>
                                            {r.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {r.totalScore ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {r.answeredCount}/{r.questionCount}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {fmtTime(r.totalTimeSeconds)}
                                    </TableCell>
                                    <TableCell>{fmtDate(r.startedAt)}</TableCell>
                                    <TableCell className="text-right">
                                        {(r.status === 'submitted' ||
                                            r.status === 'timed_out') && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    navigate(
                                                        `/admin/attempts/${r.attemptId}/report`,
                                                        { state: { studentEmail: r.studentEmail } }
                                                    )
                                                }}
                                            >
                                                View report
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            <AttemptDetailDialog
                attemptId={openAttempt}
                open={openAttempt !== null}
                onOpenChange={(o) => !o && setOpenAttempt(null)}
            />
        </AdminLayout>
    )
}
