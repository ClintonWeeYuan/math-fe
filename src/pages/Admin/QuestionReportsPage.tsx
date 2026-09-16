import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { LatexText } from '@/components/diagnostic/LatexText.tsx'
import { RescorePanel } from '@/components/diagnostic/RescorePanel.tsx'
import {
    categoryLabel,
    fetchQuestionReports,
    updateQuestionReport,
    type AdminQuestionReport,
    type ReportStatus,
    type ReportedQuestion,
} from '@/lib/questionReportsApi.ts'

const TABS: { value: ReportStatus; label: string }[] = [
    { value: 'open', label: 'Open' },
    { value: 'fixed', label: 'Fixed' },
    { value: 'dismissed', label: 'Dismissed' },
]

function fmtDate(iso: string | null): string {
    if (!iso) return '—'
    return new Date(iso).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    })
}

function ReportRow({
    report,
    correctOption,
    onUpdate,
    busy,
}: {
    report: AdminQuestionReport
    correctOption: string | null
    onUpdate: (status: ReportStatus) => void
    busy: boolean
}) {
    const picked = report.selectedOption
    return (
        <li className="flex flex-col gap-2 rounded-md border border-gray-200 p-3 dark:border-gray-800">
            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{categoryLabel(report.category)}</Badge>
                <span className="text-xs text-gray-500">
                    {report.source === 'exam' ? 'During the exam' : 'In the review'} ·{' '}
                    {fmtDate(report.createdAt)}
                </span>
                {picked && (
                    <span className="text-xs text-gray-500">
                        · picked {picked}
                        {correctOption && (picked === correctOption ? ' (the marked answer)' : ` (marked answer is ${correctOption})`)}
                    </span>
                )}
            </div>
            {report.message ? (
                <p className="whitespace-pre-wrap text-sm">{report.message}</p>
            ) : (
                <p className="text-sm text-gray-400">No message.</p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-gray-500">
                    {report.reporterEmail ?? 'Unknown student'}
                    {report.reporterIsInternal && (
                        <Badge variant="outline" className="ml-2">internal</Badge>
                    )}
                </span>
                {report.status === 'open' ? (
                    <span className="flex gap-2">
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => onUpdate('dismissed')}>
                            Dismiss
                        </Button>
                        <Button size="sm" disabled={busy} onClick={() => onUpdate('fixed')}>
                            Mark fixed
                        </Button>
                    </span>
                ) : (
                    <span className="flex items-center gap-2 text-xs text-gray-500">
                        {report.status === 'fixed' ? 'Fixed' : 'Dismissed'} {fmtDate(report.resolvedAt)}
                        <Button size="sm" variant="ghost" disabled={busy} onClick={() => onUpdate('open')}>
                            Reopen
                        </Button>
                    </span>
                )}
            </div>
            {report.adminNote && (
                <p className="text-xs text-gray-500">Note: {report.adminNote}</p>
            )}
        </li>
    )
}

function QuestionGroup({
    group,
    status,
}: {
    group: ReportedQuestion
    status: ReportStatus
}) {
    const queryClient = useQueryClient()
    const [note, setNote] = useState('')
    const { mutateAsync, isPending } = useMutation({ mutationFn: updateQuestionReport })

    async function update(reports: AdminQuestionReport[], next: ReportStatus) {
        try {
            for (const r of reports) {
                await mutateAsync({ id: r.id, status: next, adminNote: note })
            }
            toast.success(
                next === 'open'
                    ? 'Reopened'
                    : `${reports.length} report${reports.length === 1 ? '' : 's'} marked ${next}`
            )
            setNote('')
        } catch (err) {
            toast.error((err as Error).message)
        } finally {
            await queryClient.invalidateQueries({ queryKey: ['admin-question-reports'] })
        }
    }

    return (
        <article className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge>{group.reports.length} report{group.reports.length === 1 ? '' : 's'}</Badge>
                    {group.topicCode && <Badge variant="outline">{group.topicCode}</Badge>}
                    {group.questionStatus === 'draft' && <Badge variant="outline">draft</Badge>}
                    {group.correctOption && (
                        <span className="text-xs text-gray-500">Marked answer: {group.correctOption}</span>
                    )}
                </div>
                <Button asChild size="sm" variant="outline">
                    <Link to={`/admin/questions/${group.questionId}`}>Edit question</Link>
                </Button>
            </div>
            <p className="text-xs text-gray-500">
                {group.placements.length > 0 ? group.placements.join(' · ') : 'Not in any set'}
            </p>
            <div className="text-sm leading-relaxed">
                {group.stem ? <LatexText text={group.stem} /> : <span className="text-gray-400">Question deleted</span>}
            </div>
            {/* Where a report says the key is wrong, show straight away
                whether past marks disagree with the key as it now stands —
                so fixing the key in the editor and coming back here shows
                who needs re-scoring. */}
            {group.reports.some((r) => r.category === 'wrong_answer') && (
                <RescorePanel questionId={group.questionId} showWhenClean />
            )}
            <ul className="flex flex-col gap-2">
                {group.reports.map((r) => (
                    <ReportRow
                        key={r.id}
                        report={r}
                        correctOption={group.correctOption}
                        busy={isPending}
                        onUpdate={(next) => update([r], next)}
                    />
                ))}
            </ul>
            {status === 'open' && (
                <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                    <Input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Note, e.g. what you changed (optional, saved on each report)"
                        className="min-w-[240px] flex-1"
                        maxLength={1000}
                    />
                    {group.reports.length > 1 && (
                        <>
                            <Button size="sm" variant="outline" disabled={isPending} onClick={() => update(group.reports, 'dismissed')}>
                                Dismiss all
                            </Button>
                            <Button size="sm" disabled={isPending} onClick={() => update(group.reports, 'fixed')}>
                                Mark all fixed
                            </Button>
                        </>
                    )}
                </div>
            )}
        </article>
    )
}

/**
 * Problems students have reported with questions, grouped by question.
 *
 * Three reports on one question are one problem three times over, which is
 * the signal worth acting on first, so the most-reported questions lead.
 * Fixing happens in the question editor; this page is where you decide and
 * close the loop.
 */
export function QuestionReportsPage() {
    const [status, setStatus] = useState<ReportStatus>('open')
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['admin-question-reports', status],
        queryFn: () => fetchQuestionReports(status),
    })
    const groups = data ?? []
    const total = groups.reduce((n, g) => n + g.reports.length, 0)

    return (
        <AdminLayout>
            <div className="mt-8 flex max-w-4xl flex-col gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Question reports</h1>
                    <p className="text-sm text-gray-500">
                        Problems students have reported, from the exam or their review. Fix the
                        question in the editor, then mark the reports fixed.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {TABS.map((t) => (
                        <Button
                            key={t.value}
                            size="sm"
                            variant={status === t.value ? 'default' : 'outline'}
                            aria-pressed={status === t.value}
                            onClick={() => setStatus(t.value)}
                        >
                            {t.label}
                        </Button>
                    ))}
                    {!isLoading && !isError && (
                        <span className="text-sm text-gray-500">
                            {total} report{total === 1 ? '' : 's'} on {groups.length} question
                            {groups.length === 1 ? '' : 's'}
                        </span>
                    )}
                </div>
                {isLoading && <p className="text-gray-500">Loading…</p>}
                {isError && <p className="text-red-600">{(error as Error).message}</p>}
                {!isLoading && !isError && groups.length === 0 && (
                    <p className="text-gray-500">
                        {status === 'open' ? 'No open reports. Nothing waiting on you.' : `No ${status} reports yet.`}
                    </p>
                )}
                {groups.map((g) => (
                    <QuestionGroup key={g.questionId} group={g} status={status} />
                ))}
            </div>
        </AdminLayout>
    )
}
