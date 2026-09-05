import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.tsx'
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
import { profileOf, sittingLabel } from '@/lib/adminStudentProfile.ts'
import {
    ANY,
    NO_FILTERS,
    applyResultsFilters,
    countsOf,
    reconcileFilters,
    setFacets,
    studentsInBothTests,
    subjectFacets,
    testFacets,
    type ResultsFilters,
} from '@/lib/adminResultsFilters.ts'
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

/** `isInternal` is not in the generated client yet — regenerating rewrites
 *  all ~1500 lines of it, which is a change of its own. Same narrowing the
 *  catalogue and the report view use for `format`; absent, a row reads as a
 *  real student's, which is the safe direction to be wrong in (it shows,
 *  rather than silently hiding a result). */
function isInternal(row: AdminAttemptResultRow): boolean {
    return (row as { isInternal?: boolean }).isInternal === true
}

function statusVariant(status: AdminAttemptResultRow['status']) {
    if (status === 'submitted') return 'default'
    if (status === 'timed_out') return 'secondary'
    return 'outline' // in_progress / abandoned
}

/** "3 students · 7 attempts", with the singulars right — this line is read as
 *  a sentence, and "1 students" undermines every other number on the page. */
function countsLabel(counts: { students: number; attempts: number }): string {
    const s = `${counts.students} student${counts.students === 1 ? '' : 's'}`
    const a = `${counts.attempts} attempt${counts.attempts === 1 ? '' : 's'}`
    return `${s} · ${a}`
}

/**
 * Collect the results of everyone who has attempted a diagnostic: one row per
 * attempt (student, set, score, completion, time), a CSV export, a click-
 * through drill-in, and multi-select delete of selected results.
 */
export function DiagnosticResultsPage() {
    const navigate = useNavigate()
    const { data, isLoading } = useAdminResultsQuery()
    // Default hidden, because we sit these papers while writing them: our own
    // attempts otherwise sit in the table looking like student results, and
    // the first read of any number here is the one people remember. The
    // toggle exists because "was that us?" needs an answer, not a filter that
    // silently drops the evidence.
    const [showInternal, setShowInternal] = useState(false)
    const allRows = useMemo(() => data?.rows ?? [], [data])
    // The internal toggle is applied first, so every count below — tab
    // totals, dropdown counts, the summary line — describes what is actually
    // on screen. Facets computed over hidden rows would offer a subject that
    // filters to nothing.
    const visibleRows = useMemo(
        () => (showInternal ? allRows : allRows.filter((r) => !isInternal(r))),
        [allRows, showInternal]
    )
    const internalCount = allRows.filter(isInternal).length

    const [openAttempt, setOpenAttempt] = useState<string | null>(null)
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [filters, setFilters] = useState<ResultsFilters>(NO_FILTERS)
    const rows = useMemo(
        () => applyResultsFilters(visibleRows, filters),
        [visibleRows, filters]
    )

    const tests = useMemo(() => testFacets(visibleRows), [visibleRows])
    const subjects = useMemo(
        () => subjectFacets(visibleRows, filters.test),
        [visibleRows, filters.test]
    )
    const sets = useMemo(
        () => setFacets(visibleRows, filters.test, filters.subject),
        [visibleRows, filters.test, filters.subject]
    )
    const totals = useMemo(() => countsOf(visibleRows), [visibleRows])
    const shown = useMemo(() => countsOf(rows), [rows])
    const bothTests = useMemo(() => studentsInBothTests(visibleRows), [visibleRows])
    const isFiltered =
        filters.test !== ANY || filters.subject !== ANY || filters.setId !== ANY

    /** Every filter change clears the selection, for the same reason the
     *  internal toggle does: a row selected and then filtered out stays
     *  selected while off-screen, and "Delete selected" would take it. */
    function changeFilters(next: ResultsFilters) {
        setFilters(reconcileFilters(visibleRows, next))
        setSelected(new Set())
    }

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
                    {/* Exports what is on screen, not the whole table — an
                        admin who has filtered to TMUA wants the TMUA rows. The
                        label says so, because a file that quietly held more
                        than the view would be discovered in a spreadsheet. */}
                    <Button
                        variant="outline"
                        disabled={rows.length === 0}
                        onClick={() => downloadResultsCsv(rows)}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        {isFiltered ? 'Download CSV (filtered)' : 'Download CSV'}
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

                {!isLoading && allRows.length > 0 && (
                    <div className="flex flex-col gap-3 rounded-md border border-gray-200 p-3 dark:border-gray-800">
                        {/* The ESAT/TMUA split. Both counts are on screen at
                            once, so "how many sat each" is answered without
                            clicking anything; clicking narrows the table. A
                            test nobody has sat gets no tab. */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="mr-1 text-sm font-medium">Test</span>
                            <Button
                                size="sm"
                                variant={filters.test === ANY ? 'default' : 'outline'}
                                aria-pressed={filters.test === ANY}
                                onClick={() =>
                                    changeFilters({ ...filters, test: ANY })
                                }
                            >
                                All
                                <span className="ml-2 text-xs opacity-70">
                                    {totals.students}
                                </span>
                            </Button>
                            {tests.map((t) => (
                                <Button
                                    key={t.value}
                                    size="sm"
                                    variant={
                                        filters.test === t.value ? 'default' : 'outline'
                                    }
                                    aria-pressed={filters.test === t.value}
                                    onClick={() =>
                                        changeFilters({
                                            ...filters,
                                            test: t.value as ResultsFilters['test'],
                                        })
                                    }
                                >
                                    {t.label}
                                    <span className="ml-2 text-xs opacity-70">
                                        {t.students}
                                    </span>
                                </Button>
                            ))}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                students
                            </span>
                        </div>

                        {/* Subject narrows within the chosen test; set narrows
                            within the chosen subject. Both are scoped, so the
                            dropdowns never offer a combination that filters to
                            an empty table. */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="mr-1 text-sm font-medium">Subject</span>
                            <Select
                                value={filters.subject}
                                onValueChange={(v) =>
                                    changeFilters({ ...filters, subject: v })
                                }
                            >
                                <SelectTrigger
                                    className="w-[220px]"
                                    aria-label="Filter by subject"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ANY}>All subjects</SelectItem>
                                    {/* Spelled out, because the tabs above
                                        count students and these count
                                        attempts — a bare number in both
                                        places would read as the same unit. */}
                                    {subjects.map((s) => (
                                        <SelectItem key={s.value} value={s.value}>
                                            {s.label} — {s.attempts} attempt
                                            {s.attempts === 1 ? '' : 's'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <span className="mr-1 ml-2 text-sm font-medium">Set</span>
                            <Select
                                value={filters.setId}
                                onValueChange={(v) =>
                                    changeFilters({ ...filters, setId: v })
                                }
                            >
                                <SelectTrigger
                                    className="w-[300px]"
                                    aria-label="Filter by set"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ANY}>All sets</SelectItem>
                                    {sets.map((s) => (
                                        <SelectItem key={s.value} value={s.value}>
                                            {s.label} — {s.attempts} attempt
                                            {s.attempts === 1 ? '' : 's'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {isFiltered && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => changeFilters(NO_FILTERS)}
                                >
                                    Clear filters
                                </Button>
                            )}
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {countsLabel(shown)}
                            {/* Parenthesised, because the unfiltered total is
                                itself a "N · M" pair and two of them joined by
                                a bare "of" read as one long list. */}
                            {isFiltered && ` (of ${countsLabel(totals)})`}
                            {/* Without this the two tab counts read as a
                                partition. A student who sat both is counted
                                under each, so ESAT + TMUA can exceed the
                                total — say so rather than leave the numbers
                                looking wrong. */}
                            {filters.test === ANY && bothTests > 0 && (
                                <span>
                                    {' '}
                                    · {bothTests} sat both ESAT and TMUA, so the two
                                    test counts overlap
                                </span>
                            )}
                        </p>
                    </div>
                )}

                {!isLoading && internalCount > 0 && (
                    <label className="flex w-fit items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Checkbox
                            checked={showInternal}
                            onCheckedChange={(v) => {
                                setShowInternal(v === true)
                                // Otherwise a row selected before the toggle
                                // stays selected while hidden, and Delete
                                // selected takes something off-screen.
                                setSelected(new Set())
                            }}
                            aria-label="Show internal accounts"
                        />
                        Show internal accounts ({internalCount} hidden)
                    </label>
                )}

                {isLoading && <p className="text-gray-500">Loading…</p>}

                {!isLoading && rows.length === 0 && (
                    <p className="text-gray-500">
                        {/* Three different nothings, and they call for three
                            different actions: clear a filter, tick a box, or
                            wait for a student. Saying "no results" to all
                            three reads as "nobody has sat anything". */}
                        {isFiltered && visibleRows.length > 0
                            ? 'No attempts match these filters — try Clear filters.'
                            : allRows.length > 0
                              ? 'Every attempt so far is from an internal account — tick “Show internal accounts” to see them.'
                              : 'No attempts yet — results appear here once a student sits a diagnostic.'}
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
                                {/* Two of the six profile fields, chosen
                                    because they are the ones scanned rather
                                    than looked up: school groups the table,
                                    and sitting says which Season Pass this
                                    student is the market for. Level, state and
                                    target universities are in the CSV, where
                                    there is no width to run out of. */}
                                <TableHead>School</TableHead>
                                <TableHead>Sitting</TableHead>
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
                            {rows.map((r) => {
                            const profile = profileOf(r)
                            return (
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
                                        {/* The name leads once we have one,
                                            with the email kept underneath: it
                                            is still the identifier an admin
                                            searches by, and two students can
                                            share a first name. */}
                                        {profile.studentName ?? r.studentEmail ?? '—'}
                                        {profile.studentName && (
                                            <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">
                                                {r.studentEmail}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>{profile.school ?? '—'}</TableCell>
                                    <TableCell>
                                        {sittingLabel(profile.testSitting)}
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
                            )
                            })}
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
