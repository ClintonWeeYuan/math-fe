import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { Seo } from '@/components/Seo.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import useMyAttemptsQuery from '@/hooks/diagnostic/useMyAttemptsQuery.ts'
import useListPublishedSetsQuery from '@/hooks/diagnostic/useListPublishedSetsQuery.ts'
import { testFromSubject } from '@/lib/diagnosticNextSteps.ts'
import {
    actionFor,
    coverageFor,
    groupCoverageBySubject,
    type CoverageRow,
    type StudentAttempt,
    type SubjectCoverage,
} from '@/lib/myResults.ts'
import { BILLING_LIVE } from '@/lib/billing.ts'
import { trackEvent } from '@/lib/analytics.ts'

/**
 * Everything a student has sat, and what they have not.
 *
 * Two views of the same history, because they answer different questions. The
 * coverage grid answers "what have I not done", which is driven by the
 * catalogue and so can show a module they have never opened. The list below
 * answers "what happened when I sat this", and keeps every attempt including
 * the ones the grid collapses — three goes at one paper are one completion up
 * top and three rows down here.
 */

function fmtDate(iso: string | null | undefined): string {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

/** "ESAT Math 1" -> "Math 1", once the heading has already said which test. */
function moduleName(subject: string | null | undefined, fallback: string) {
    if (!subject) return fallback
    return subject.replace(/^(ESAT|TMUA)\s+/i, '')
}

const STATE_LABEL: Record<CoverageRow['state'], string> = {
    completed: 'Done',
    // Not "Completed": a paper answered ten questions of twenty-seven has
    // ended, but telling a student they have completed it is telling them not
    // to go back.
    partial: 'Part done',
    in_progress: 'In progress',
    not_attempted: 'Not started',
}

const STATE_STYLE: Record<CoverageRow['state'], string> = {
    completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    partial: 'border-amber-200 bg-amber-50 text-amber-800',
    in_progress: 'border-amber-200 bg-amber-50 text-amber-700',
    not_attempted: 'border-slate-200 bg-slate-50 text-slate-500',
}

/** "ESAT Biology — Mini Test" -> "Mini Test". The module heading above has
 *  already said which subject this is; repeating it on every row was most of
 *  what made the old grid unreadable. */
function setName(title: string, subject: string | null | undefined): string {
    if (!subject) return title
    const withoutSubject = title.replace(subject, '').trim()
    return withoutSubject.replace(/^[—–-]\s*/, '') || title
}

/** One set within a module: a compact row, not a card. Fifteen cards competing
 *  for attention is what made the old grid impossible to scan. */
function CoverageSetRow({ row }: { row: CoverageRow }) {
    const navigate = useNavigate()
    const startable = row.set.isFree || BILLING_LIVE
    const attempt = row.attempt

    return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-slate-100 py-2.5 last:border-b-0">
            <span
                className={`w-[88px] shrink-0 rounded-full border px-2 py-0.5 text-center text-[11px] font-medium ${
                    STATE_STYLE[row.state]
                }`}
            >
                {STATE_LABEL[row.state]}
            </span>

            <span className="min-w-0 flex-1 text-sm">
                {setName(row.set.title, row.set.subject)}
                {attempt && (
                    <span className="text-slate-500">
                        {' · '}
                        {attempt.answeredCount}/{attempt.questionCount} answered
                        {attempt.totalScore !== null &&
                            attempt.totalScore !== undefined &&
                            ` · scored ${attempt.totalScore}`}
                    </span>
                )}
            </span>

            <span className="shrink-0">
                {!startable ? (
                    /* A link, not a gate. The server already refuses a paid
                       set, and the checkout it would lead to does not exist
                       yet. Muted, because it is the one row here nobody can
                       act on. */
                    <Link
                        to="/diagnostics"
                        className="text-sm text-slate-400 underline underline-offset-4"
                    >
                        Season Pass
                    </Link>
                ) : row.state === 'in_progress' && attempt ? (
                    <Button
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => {
                            trackEvent('resume_clicked', { attemptId: attempt.attemptId })
                            navigate(`/diagnostic/attempts/${attempt.attemptId}`)
                        }}
                    >
                        Resume →
                    </Button>
                ) : attempt ? (
                    <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => {
                            trackEvent('report_reopened', { attemptId: attempt.attemptId })
                            navigate(`/diagnostic/attempts/${attempt.attemptId}/report`)
                        }}
                    >
                        {row.state === 'partial' ? 'Report' : 'See report →'}
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => navigate(`/diagnostic/sets/${row.set.id}`)}
                    >
                        Start →
                    </Button>
                )}
            </span>
        </div>
    )
}

/** One module, with its sets beneath it. The module is the unit a student
 *  thinks in — "have I done Biology?" — so it is the unit the page groups by. */
function ModuleSection({ group }: { group: SubjectCoverage }) {
    const done = group.startable > 0 && group.sat === group.startable

    return (
        <div className="rounded-lg border border-slate-200 p-4">
            <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">
                    {moduleName(group.subject, group.subject)}
                </p>
                <p
                    className={`text-sm ${
                        done ? 'text-emerald-700' : 'text-slate-500'
                    }`}
                >
                    {group.startable === 0
                        ? 'Season Pass only'
                        : `${group.sat} of ${group.startable} done`}
                </p>
            </div>
            {group.rows.map((row) => (
                <CoverageSetRow key={row.set.id} row={row} />
            ))}
        </div>
    )
}

function HistoryRow({ attempt }: { attempt: StudentAttempt }) {
    const navigate = useNavigate()
    const action = actionFor(attempt)
    const isMini = attempt.format === 'mini'

    return (
        <div className="flex flex-col gap-3 border-b border-slate-100 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p className="font-medium">
                    {attempt.setTitle ?? 'Diagnostic'}
                    {isMini && (
                        <span className="ml-2 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                            Mini
                        </span>
                    )}
                </p>
                <p className="text-sm text-slate-500">
                    {fmtDate(attempt.startedAt)} ·{' '}
                    {attempt.status === 'in_progress'
                        ? 'Not finished'
                        : attempt.status === 'timed_out'
                          ? 'Ran out of time'
                          : 'Submitted'}
                    {' · '}
                    {attempt.answeredCount}/{attempt.questionCount} answered
                    {attempt.totalScore !== null &&
                        attempt.totalScore !== undefined &&
                        ` · scored ${attempt.totalScore}`}
                </p>
            </div>

            <div className="shrink-0">
                {action === 'resume' && (
                    <Button
                        className="cursor-pointer"
                        onClick={() => {
                            trackEvent('resume_clicked', {
                                attemptId: attempt.attemptId,
                            })
                            navigate(`/diagnostic/attempts/${attempt.attemptId}`)
                        }}
                    >
                        Resume →
                    </Button>
                )}
                {action === 'retake' && (
                    <div className="flex flex-wrap gap-2">
                        <Button
                            className="cursor-pointer"
                            onClick={() => {
                                trackEvent('retake_clicked', {
                                    attemptId: attempt.attemptId,
                                    metadata: { setId: attempt.setId },
                                })
                                navigate(`/diagnostic/sets/${attempt.setId}`)
                            }}
                        >
                            Sit it again →
                        </Button>
                        {/* The report still exists and is still theirs — the
                            retake is the better offer, not the only one. */}
                        <Button
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => {
                                trackEvent('report_reopened', {
                                    attemptId: attempt.attemptId,
                                })
                                navigate(
                                    `/diagnostic/attempts/${attempt.attemptId}/report`
                                )
                            }}
                        >
                            Report
                        </Button>
                    </div>
                )}
                {action === 'report' && (
                    <Button
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => {
                            trackEvent('report_reopened', {
                                attemptId: attempt.attemptId,
                            })
                            navigate(
                                `/diagnostic/attempts/${attempt.attemptId}/report`
                            )
                        }}
                    >
                        See report →
                    </Button>
                )}
            </div>
        </div>
    )
}

export function MyResultsPage() {
    const navigate = useNavigate()
    const { data: attempts, isLoading, isError } = useMyAttemptsQuery()

    // Which test's catalogue to show coverage for: the one they have actually
    // been sitting. A student with no attempts has told us nothing, so they
    // get the catalogue rather than a grid of things they have not done.
    const test = testFromSubject(attempts?.[0]?.subject)
    const { data: sets } = useListPublishedSetsQuery(test)
    const coverage = coverageFor({ sets, attempts })
    const modules = groupCoverageBySubject(coverage, { billingLive: BILLING_LIVE })
    // Papers, not modules. "0 of 4 modules fully done" sat above modules each
    // reading "1 of 2 done", which looks like a contradiction until you work
    // out that fully means all of them. Counting papers makes the headline the
    // arithmetic sum of the lines beneath it.
    const papersDone = modules.reduce((n, m) => n + m.sat, 0)
    const papersStartable = modules.reduce((n, m) => n + m.startable, 0)

    useEffect(() => {
        trackEvent('dashboard_viewed')
    }, [])

    return (
        <LandingLayout>
            <Seo
                title="My Results | JomExam"
                description="Every diagnostic you have sat, your reports, and which modules you have left to cover."
                path="/my-results"
            />
            <div className="px-4 md:px-[50px] xl:px-[150px] py-12 md:py-20 max-w-4xl">
                <p className="text-3xl md:text-5xl font-bold mb-3 leading-tight">
                    My results
                </p>
                <p className="text-slate-500 mb-10 max-w-2xl">
                    Every paper you have sat, and what is left to cover.
                </p>

                {isLoading && <p className="text-slate-500">Loading…</p>}

                {isError && (
                    <p className="text-slate-500">
                        We couldn&apos;t load your results just now. Refresh to
                        try again.
                    </p>
                )}

                {!isLoading && !isError && attempts?.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-start gap-4 pt-6">
                            <p className="text-slate-600">
                                You haven&apos;t sat a diagnostic yet. Set A of
                                every module is free.
                            </p>
                            <Button
                                className="cursor-pointer"
                                onClick={() => navigate('/diagnostics')}
                            >
                                Browse the diagnostics →
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {!isLoading && !isError && (attempts?.length ?? 0) > 0 && (
                    <>
                        {modules.length > 0 && (
                            <section className="mb-12">
                                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                                    <h2 className="text-xl font-medium">
                                        Your coverage
                                    </h2>
                                    {/* The one number worth reading first.
                                        Fifteen badges do not answer "how am I
                                        doing" — this does. */}
                                    <p className="text-sm text-slate-500">
                                        {papersDone} of {papersStartable} papers
                                        done
                                    </p>
                                </div>
                                {/* Stacked, not a grid. Each row inside a
                                    module is horizontal — badge, name, detail,
                                    action — so two columns halved the width
                                    and wrapped every row onto three lines. */}
                                <div className="flex flex-col gap-3">
                                    {modules.map((group) => (
                                        <ModuleSection
                                            key={group.subject}
                                            group={group}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        <section>
                            <h2 className="text-xl font-medium mb-2">
                                Every attempt
                            </h2>
                            <p className="text-sm text-slate-500 mb-4">
                                Including repeats — sitting a paper twice counts
                                once above, and appears twice here.
                            </p>
                            <Card>
                                <CardContent className="pt-2">
                                    {(attempts ?? []).map((attempt) => (
                                        <HistoryRow
                                            key={attempt.attemptId}
                                            attempt={attempt}
                                        />
                                    ))}
                                </CardContent>
                            </Card>
                        </section>
                    </>
                )}
            </div>
        </LandingLayout>
    )
}
