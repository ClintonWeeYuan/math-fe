import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download } from 'lucide-react'
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
import useAdminResultsQuery from '@/hooks/diagnostic/useAdminResultsQuery.ts'
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
 * attempt (student, set, score, completion, time), a CSV export of the whole
 * table, and a click-through drill-in to a student's per-question answers.
 */
export function DiagnosticResultsPage() {
    const navigate = useNavigate()
    const { data, isLoading } = useAdminResultsQuery()
    const rows = data?.rows ?? []

    const [openAttempt, setOpenAttempt] = useState<string | null>(null)

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
                                    onClick={() => setOpenAttempt(r.attemptId)}
                                >
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
