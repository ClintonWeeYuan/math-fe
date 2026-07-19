import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table.tsx'
import useAdminAttemptDetailQuery from '@/hooks/diagnostic/useAdminAttemptDetailQuery.ts'

type Props = {
    attemptId: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

/**
 * Admin drill-in for one attempt: what the student picked vs. the correct
 * option on each question, right/wrong, and per-question pacing. Loads on
 * demand from the admin detail endpoint (any attempt, not owner-scoped).
 */
export function AttemptDetailDialog({ attemptId, open, onOpenChange }: Props) {
    const { data, isLoading } = useAdminAttemptDetailQuery(open ? attemptId : null)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Attempt detail</DialogTitle>
                    <DialogDescription>
                        {data
                            ? `${data.studentEmail ?? 'Unknown student'} · ${
                                  data.setTitle ?? 'Untitled set'
                              }${data.subject ? ` · ${data.subject}` : ''} · ${
                                  data.status
                              }${
                                  data.totalScore !== null &&
                                  data.totalScore !== undefined
                                      ? ` · score ${data.totalScore}`
                                      : ''
                              }`
                            : 'Loading…'}
                    </DialogDescription>
                </DialogHeader>

                {isLoading && <p className="text-gray-500">Loading detail…</p>}

                {!isLoading && data && data.rows.length === 0 && (
                    <p className="text-gray-500">
                        No answers recorded for this attempt yet.
                    </p>
                )}

                {!isLoading && data && data.rows.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">#</TableHead>
                                <TableHead>Topic</TableHead>
                                <TableHead>Skill</TableHead>
                                <TableHead>Picked</TableHead>
                                <TableHead>Correct</TableHead>
                                <TableHead>Result</TableHead>
                                <TableHead className="text-right">Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.rows.map((r) => (
                                <TableRow key={r.questionId}>
                                    <TableCell>{r.questionOrderIndex + 1}</TableCell>
                                    <TableCell>{r.topicCode ?? '—'}</TableCell>
                                    <TableCell>{r.coreSkillPrimary ?? '—'}</TableCell>
                                    <TableCell>{r.selectedOption ?? '—'}</TableCell>
                                    <TableCell>{r.correctOption ?? '—'}</TableCell>
                                    <TableCell>
                                        {r.isCorrect === null ||
                                        r.isCorrect === undefined ? (
                                            <Badge variant="outline">—</Badge>
                                        ) : r.isCorrect ? (
                                            <Badge className="bg-emerald-600">✓</Badge>
                                        ) : (
                                            <Badge variant="destructive">✗</Badge>
                                        )}
                                        {r.isFlagged && (
                                            <Badge variant="outline" className="ml-1">
                                                flag
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {r.totalTimeSeconds}s
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </DialogContent>
        </Dialog>
    )
}
