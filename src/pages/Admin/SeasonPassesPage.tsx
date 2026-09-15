import { Fragment, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
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
import useSeasonPassHoldersQuery from '@/hooks/billing/useSeasonPassHoldersQuery.ts'
import { sittingLabel } from '@/lib/adminStudentProfile.ts'
import { countryName } from '@/lib/countries.ts'
import type {
    AttemptStatus,
    PaperProgress,
    SeasonPassHolder,
} from '@/lib/adminSeasonPassesApi.ts'

type TestFilter = 'all' | 'esat' | 'tmua'

function fmtDate(iso: string | null | undefined, withTime = false): string {
    if (!iso) return '—'
    return new Date(iso).toLocaleString(
        undefined,
        withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' }
    )
}

/** A comp (test null) opens every test, so it matches every filter. */
function holdsTest(holder: SeasonPassHolder, test: TestFilter): boolean {
    if (test === 'all') return true
    return holder.passes.some((p) => p.test === null || p.test === test)
}

const STATUS_LABEL: Record<AttemptStatus, string> = {
    submitted: 'Submitted',
    timed_out: 'Timed out',
    in_progress: 'In progress',
    abandoned: 'Abandoned',
}

function statusVariant(status: AttemptStatus) {
    if (status === 'submitted') return 'default' as const
    if (status === 'timed_out') return 'secondary' as const
    return 'outline' as const
}

function ProgressBar({ done, total }: { done: number; total: number }) {
    const pct = total === 0 ? 0 : Math.round((done / total) * 100)
    return (
        <div className="flex items-center gap-2">
            <div
                className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800"
                role="progressbar"
                aria-valuenow={done}
                aria-valuemax={total}
            >
                <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
            <span className="tabular-nums text-sm">
                {done}/{total}
            </span>
        </div>
    )
}

/**
 * One holder's papers, grouped by subject. Every paper their pass opens is
 * listed, sat or not, because the ones they have not touched are half of what
 * this view is for.
 */
function PaperBreakdown({
    holder,
    startedOnly,
}: {
    holder: SeasonPassHolder
    startedOnly: boolean
}) {
    const navigate = useNavigate()
    const papers = startedOnly
        ? holder.papers.filter((p) => p.attemptCount > 0)
        : holder.papers
    const bySubject = useMemo(() => {
        const groups = new Map<string, PaperProgress[]>()
        for (const p of papers) {
            const key = p.subject ?? 'Uncategorised'
            groups.set(key, [...(groups.get(key) ?? []), p])
        }
        return [...groups.entries()]
    }, [papers])

    if (papers.length === 0) {
        return (
            <p className="py-2 text-sm text-gray-500">
                {startedOnly ? 'No papers started yet.' : 'No papers in this pass yet.'}
            </p>
        )
    }

    return (
        <div className="flex flex-col gap-4 py-2">
            {bySubject.map(([subject, rows]) => {
                const done = rows.filter((p) => p.bestScore !== null).length
                return (
                    <div key={subject}>
                        <p className="mb-1 text-sm font-medium">
                            {subject}{' '}
                            <span className="font-normal text-gray-500">
                                · {done} of {rows.length} completed
                            </span>
                        </p>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Paper</TableHead>
                                    <TableHead>Access</TableHead>
                                    <TableHead>Latest status</TableHead>
                                    <TableHead className="text-right">Latest score</TableHead>
                                    <TableHead className="text-right">Best</TableHead>
                                    <TableHead className="text-right">Sittings</TableHead>
                                    <TableHead>Last sat</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((p) => {
                                    const finished =
                                        p.latestStatus === 'submitted' ||
                                        p.latestStatus === 'timed_out'
                                    return (
                                        <TableRow key={p.setId}>
                                            <TableCell>
                                                {p.title ?? '—'}
                                                {p.format === 'mini' && (
                                                    <Badge variant="outline" className="ml-2">
                                                        Mini
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={p.isFree ? 'outline' : 'secondary'}>
                                                    {p.isFree ? 'Free' : 'Paid'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {p.latestStatus ? (
                                                    <Badge variant={statusVariant(p.latestStatus)}>
                                                        {STATUS_LABEL[p.latestStatus]}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-sm text-gray-500">
                                                        Not started
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {p.latestStatus === 'in_progress'
                                                    ? `${p.latestAnswered}/${p.questionCount} answered`
                                                    : p.latestScore !== null
                                                      ? `${p.latestScore}/${p.questionCount}`
                                                      : '—'}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {p.bestScore !== null
                                                    ? `${p.bestScore}/${p.questionCount}`
                                                    : '—'}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {p.attemptCount}
                                            </TableCell>
                                            <TableCell>{fmtDate(p.latestStartedAt, true)}</TableCell>
                                            <TableCell className="text-right">
                                                {finished && p.latestAttemptId && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/attempts/${p.latestAttemptId}/report`,
                                                                { state: { studentEmail: holder.email } }
                                                            )
                                                        }
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
                    </div>
                )
            })}
        </div>
    )
}

/**
 * Everyone holding a Season Pass — bought, comped, or expired — with their
 * progress through the papers the pass opens. Click a student for the paper
 * by paper breakdown.
 */
export function SeasonPassesPage() {
    const { data, isLoading, isError } = useSeasonPassHoldersQuery()
    // Hidden by default for the same reason the Results page hides them: our
    // own comped accounts otherwise read as customers.
    const [showInternal, setShowInternal] = useState(false)
    const [startedOnly, setStartedOnly] = useState(false)
    const [test, setTest] = useState<TestFilter>('all')
    const [open, setOpen] = useState<Set<string>>(new Set())

    const all = useMemo(() => data ?? [], [data])
    const visible = useMemo(
        () => (showInternal ? all : all.filter((h) => !h.isInternal)),
        [all, showInternal]
    )
    const holders = useMemo(() => visible.filter((h) => holdsTest(h, test)), [visible, test])
    const internalCount = all.filter((h) => h.isInternal).length
    const paidCount = visible.filter((h) => h.passes.some((p) => p.source === 'stripe')).length

    function toggle(id: string) {
        setOpen((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    return (
        <AdminLayout>
            <div className="mt-8 flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Season Pass</h1>
                    <p className="text-sm text-gray-500">
                        Everyone holding a pass, and how far through the papers they
                        are. Click a student for the paper-by-paper breakdown.
                    </p>
                </div>

                {!isLoading && !isError && all.length > 0 && (
                    <div className="flex flex-col gap-3 rounded-md border border-gray-200 p-3 dark:border-gray-800">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="mr-1 text-sm font-medium">Test</span>
                            {(['all', 'esat', 'tmua'] as const).map((t) => (
                                <Button
                                    key={t}
                                    size="sm"
                                    variant={test === t ? 'default' : 'outline'}
                                    aria-pressed={test === t}
                                    onClick={() => setTest(t)}
                                >
                                    {t === 'all' ? 'All' : t.toUpperCase()}
                                    <span className="ml-2 text-xs opacity-70">
                                        {visible.filter((h) => holdsTest(h, t)).length}
                                    </span>
                                </Button>
                            ))}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {holders.length} holder{holders.length === 1 ? '' : 's'} shown ·{' '}
                            {paidCount} paid through Stripe
                        </p>
                        <div className="flex flex-wrap gap-4">
                            {internalCount > 0 && (
                                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Checkbox
                                        checked={showInternal}
                                        onCheckedChange={(v) => setShowInternal(v === true)}
                                        aria-label="Show internal accounts"
                                    />
                                    Show internal accounts ({internalCount} hidden)
                                </label>
                            )}
                            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Checkbox
                                    checked={startedOnly}
                                    onCheckedChange={(v) => setStartedOnly(v === true)}
                                    aria-label="Only papers they have started"
                                />
                                In the breakdown, only show papers they&apos;ve started
                            </label>
                        </div>
                    </div>
                )}

                {isLoading && <p className="text-gray-500">Loading…</p>}
                {isError && (
                    <p className="text-red-600">Could not load Season Pass holders.</p>
                )}

                {!isLoading && !isError && holders.length === 0 && (
                    <p className="text-gray-500">
                        {all.length === 0
                            ? 'Nobody holds a Season Pass yet.'
                            : visible.length === 0
                              ? 'Every pass so far is on an internal account — tick “Show internal accounts” to see them.'
                              : 'No holders for this test.'}
                    </p>
                )}

                {!isLoading && !isError && holders.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-8" />
                                <TableHead>Student</TableHead>
                                <TableHead>Pass</TableHead>
                                <TableHead>Bought</TableHead>
                                <TableHead>Expires</TableHead>
                                <TableHead>Sitting</TableHead>
                                <TableHead>Paid papers done</TableHead>
                                <TableHead>All papers done</TableHead>
                                <TableHead>Last active</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {holders.map((h) => {
                                const isOpen = open.has(h.studentId)
                                return (
                                    <Fragment key={h.studentId}>
                                        <TableRow
                                            className="cursor-pointer"
                                            onClick={() => toggle(h.studentId)}
                                            aria-expanded={isOpen}
                                        >
                                            <TableCell>
                                                {isOpen ? (
                                                    <ChevronDown className="h-4 w-4" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4" />
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {h.name ?? h.email ?? '—'}
                                                {h.name && (
                                                    <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">
                                                        {h.email}
                                                    </span>
                                                )}
                                                {h.country && (
                                                    <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">
                                                        {countryName(h.country)}
                                                    </span>
                                                )}
                                                {h.school && (
                                                    <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">
                                                        {h.school}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    {h.passes.map((p) => (
                                                        <div
                                                            key={p.product}
                                                            className="flex flex-wrap items-center gap-1"
                                                        >
                                                            <span className="text-sm">{p.label}</span>
                                                            <Badge variant="outline">
                                                                {p.source === 'stripe' ? 'Paid' : p.source}
                                                            </Badge>
                                                            {!p.isLive && (
                                                                <Badge variant="destructive">Expired</Badge>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {h.passes.map((p) => (
                                                    <span key={p.product} className="block">
                                                        {fmtDate(p.purchasedAt)}
                                                    </span>
                                                ))}
                                            </TableCell>
                                            <TableCell>
                                                {h.passes.map((p) => (
                                                    <span key={p.product} className="block">
                                                        {p.expiresAt ? fmtDate(p.expiresAt) : 'Never'}
                                                    </span>
                                                ))}
                                            </TableCell>
                                            <TableCell>{sittingLabel(h.testSitting)}</TableCell>
                                            <TableCell>
                                                <ProgressBar
                                                    done={h.paidPapersCompleted}
                                                    total={h.paidPapersTotal}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <ProgressBar
                                                    done={h.papersCompleted}
                                                    total={h.papers.length}
                                                />
                                            </TableCell>
                                            <TableCell>{fmtDate(h.lastActiveAt, true)}</TableCell>
                                        </TableRow>
                                        {isOpen && (
                                            <TableRow className="hover:bg-transparent">
                                                <TableCell />
                                                <TableCell colSpan={8}>
                                                    <PaperBreakdown
                                                        holder={h}
                                                        startedOnly={startedOnly}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </Fragment>
                                )
                            })}
                        </TableBody>
                    </Table>
                )}
            </div>
        </AdminLayout>
    )
}
