import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Seo } from '@/components/Seo.tsx'
import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { Button } from '@/components/ui/button.tsx'
import useListPublishedSetsQuery from '@/hooks/diagnostic/useListPublishedSetsQuery.ts'
import type { DiagnosticTest } from '@/hooks/diagnostic/useListPublishedSetsQuery.ts'
import useMyAttemptsQuery from '@/hooks/diagnostic/useMyAttemptsQuery.ts'
import useEsatModules from '@/hooks/diagnostic/useEsatModules.ts'
import type { PublishedDiagnosticSet } from '@/client'
import { BILLING_LIVE, formatSeasonPrice } from '@/lib/billing.ts'
import { trackEvent } from '@/lib/analytics.ts'
import type { SeasonOffer } from '@/lib/billingApi.ts'
import { testFromSubject } from '@/lib/diagnosticNextSteps.ts'
import { coverageFor, type CoverageRow } from '@/lib/myResults.ts'
import {
    ESAT_MODULES,
    MAX_EXTRA_MODULES,
    isValidChoice,
    subjectsFor,
    type EsatModule,
} from '@/lib/esatModules.ts'
import { useAuth } from '@/components/auth/AuthContext.tsx'
import useBillingStatusQuery from '@/hooks/billing/useBillingStatusQuery.ts'

/** Whether a set is a mini test. Read through a narrowing because `format` is
 * not in the generated client yet; absent, a set reads as a full paper, which
 * is the pre-mini behaviour. */
function isMini(set: PublishedDiagnosticSet): boolean {
    return (set as { format?: 'mini' | 'full' }).format === 'mini'
}

/** The order modules appear in: the ESAT's own order (Maths 1 first, because
 *  everyone sits it), then the TMUA papers, then anything else alphabetically.
 *  Alphabetical alone put Biology at the top, which few students sit. */
const SUBJECT_ORDER = [...ESAT_MODULES.map((m) => m.subject), 'TMUA Paper 1', 'TMUA Paper 2']

function subjectRank(subject: string): number {
    const i = SUBJECT_ORDER.indexOf(subject)
    return i === -1 ? SUBJECT_ORDER.length : i
}

/** "ESAT Math 1" → "Maths 1", "TMUA Paper 2" → "Paper 2". */
function moduleName(subject: string): string {
    return (
        ESAT_MODULES.find((m) => m.subject === subject)?.label ??
        subject.replace(/^(ESAT|TMUA)\s+/i, '')
    )
}

/** "ESAT Physics — Diagnostic Set C" → "C"; anything unrecognised keeps its
 *  whole title, so a set named differently still shows something sensible. */
function setLetter(set: PublishedDiagnosticSet): string {
    return set.title.match(/Set\s+([A-Z0-9]+)\s*$/i)?.[1] ?? set.title
}

type Group = { subject: string; sets: PublishedDiagnosticSet[] }

/** Group published sets by subject, in SUBJECT_ORDER, uncategorised last. */
function groupBySubject(sets: PublishedDiagnosticSet[]): Group[] {
    const by = new Map<string, PublishedDiagnosticSet[]>()
    for (const s of sets) {
        const key = s.subject ?? 'Other'
        const list = by.get(key)
        if (list) list.push(s)
        else by.set(key, [s])
    }
    return [...by.entries()]
        .sort(
            ([a], [b]) => subjectRank(a) - subjectRank(b) || a.localeCompare(b)
        )
        .map(([subject, subjectSets]) => ({ subject, sets: subjectSets }))
}

/** What a student has done to one set, said in a few characters: their best
 *  score, or what tapping it will do. */
type SetState =
    | { kind: 'done'; label: string }
    | { kind: 'resume' }
    | { kind: 'start' }
    | { kind: 'locked' }

function stateFor(
    set: PublishedDiagnosticSet,
    row: CoverageRow | undefined,
    unlocked: boolean
): SetState {
    if (row?.state === 'completed' || row?.state === 'partial') {
        const a = row.attempt
        const label =
            a && a.totalScore != null && a.questionCount > 0
                ? `${Math.round((a.totalScore / a.questionCount) * 100)}%`
                : 'Done'
        return { kind: 'done', label }
    }
    if (row?.state === 'in_progress') return { kind: 'resume' }
    return set.isFree || unlocked ? { kind: 'start' } : { kind: 'locked' }
}

type Props = {
    /** Show one admissions test's catalogue; omit for the combined page. */
    test?: DiagnosticTest
}

/** Per-test page copy — ESAT and TMUA are separate products, so each gets
 * its own heading, blurb and search metadata rather than sharing one. */
const COPY: Record<
    'all' | DiagnosticTest,
    {
        headPrefix: string
        heading: string
        lead: string
        title: string
        description: string
        path: string
        guidePath: string
        guideLabel: string
    }
> = {
    all: {
        guidePath: '/guides',
        guideLabel: 'New to these tests? Read the guides',
        headPrefix: 'Timed',
        heading: 'diagnostics.',
        lead: 'Sit a timed diagnostic and get a report mapped to specific skills — so you know exactly where to focus. Set A of every subject is free to sit.',
        title: 'Diagnostic Tests | JomExam',
        description:
            'Sit a timed ESAT or TMUA diagnostic and get a report mapped to specific skills, so you know exactly where you stand before you start prepping.',
        path: '/diagnostics',
    },
    esat: {
        guidePath: '/guides/esat-practice-tests',
        guideLabel: 'New to the ESAT? Read the ESAT practice guide',
        headPrefix: 'ESAT',
        heading: 'diagnostics.',
        lead: 'Timed ESAT papers — Mathematics 1, Mathematics 2, Physics, Chemistry and Biology — each mapped to the skills the test examines. Set A of every subject is free to sit.',
        title: 'ESAT Practice Tests & Diagnostics | JomExam',
        description:
            'Timed ESAT diagnostics for Mathematics 1, Mathematics 2, Physics, Chemistry and Biology. Sit a paper under exam conditions and get a skills report showing exactly where to focus.',
        path: '/diagnostics/esat',
    },
    tmua: {
        guidePath: '/guides/tmua-practice-tests',
        guideLabel: 'New to the TMUA? Read the TMUA practice guide',
        headPrefix: 'TMUA',
        heading: 'diagnostics.',
        lead: 'Timed TMUA papers — Paper 1 (Applications of Mathematical Knowledge) and Paper 2 (Mathematical Reasoning) — mapped to the skills each paper examines. Set A of each paper is free to sit.',
        title: 'TMUA Practice Tests & Diagnostics | JomExam',
        description:
            'Timed TMUA diagnostics for Paper 1 and Paper 2. Sit a paper under exam conditions and get a skills report showing exactly where to focus.',
        path: '/diagnostics/tmua',
    },
}

/**
 * Public diagnostics catalogue: published sets grouped by module, each module
 * a compact block — the free Mini and Set A to start with, then every full
 * paper as a lettered tile showing the student's best score or what tapping it
 * will do. Browsing is open to anyone; starting an attempt still routes
 * through login (the start screen is protected).
 *
 * The ESAT page first asks which modules the student is sitting and then shows
 * only those: five modules of eleven sets each was a long scroll past papers
 * most students will never sit. TMUA has no picker, as everyone sits both.
 *
 * Rendered per test (/diagnostics/esat, /diagnostics/tmua) and combined
 * (/diagnostics). Crawlers read the prerendered page, not this one, so the
 * picker hides nothing from search.
 */
export function DiagnosticsCatalogPage({ test }: Props) {
    const copy = COPY[test ?? 'all']
    const { user } = useAuth()
    const signedIn = user !== null
    const navigate = useNavigate()

    // Asked for everyone, signed in or not: the price list is public, and a
    // visitor deciding whether to make an account is exactly who needs to see
    // that these papers are on sale rather than "coming soon".
    const { data: billing } = useBillingStatusQuery({
        enabled: BILLING_LIVE,
        signedIn,
    })
    // Per test, not "holds anything". An ESAT pass does not open a paid
    // TMUA paper, and a tile that says otherwise sends the student into a
    // 402 they had no warning of.
    const coveredTests = billing?.coveredTests ?? []
    // Whether there is anything to sell at all. The catalogue never runs
    // checkout itself — the start screen has room for the choice — so this
    // only decides between an unlock link and "coming soon".
    const canBuy = BILLING_LIVE && (billing?.seasons?.length ?? 0) > 0

    const { data: sets, isLoading } = useListPublishedSetsQuery(test)
    const { data: attempts } = useMyAttemptsQuery({ enabled: signedIn })
    const coverage = new Map(
        coverageFor({ sets, attempts }).map((row) => [row.set.id, row])
    )

    const esat = useEsatModules({ enabled: test === 'esat', signedIn })
    const [showAll, setShowAll] = useState(false)
    const [changing, setChanging] = useState(false)

    const allGroups = groupBySubject(sets ?? [])
    const chosen = test === 'esat' && !showAll ? esat.modules : null
    const groups = chosen
        ? allGroups.filter((g) => subjectsFor(chosen).has(g.subject))
        : allGroups

    const picking =
        test === 'esat' &&
        !esat.isLoading &&
        (changing || (esat.modules === null && !showAll))

    // One Season Pass line per test on the page, rather than a price on every
    // locked paper.
    const passTests = [
        ...new Set(
            groups
                .flatMap((g) => g.sets)
                .filter((s) => !s.isFree)
                .map((s) => testFromSubject(s.subject))
                .filter((t): t is DiagnosticTest => t !== undefined)
                .filter((t) => !coveredTests.includes(t))
        ),
    ]

    const toStartScreen = (set: PublishedDiagnosticSet) =>
        navigate(`/diagnostic/sets/${set.id}`)

    return (
        <LandingLayout>
            <Seo
                title={copy.title}
                description={copy.description}
                path={copy.path}
            />
            <div className="px-4 md:px-[50px] xl:px-[150px] py-12 md:py-20 max-w-4xl">
                <p className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                    {copy.headPrefix}{' '}
                    <span style={{ color: '#799ED1' }}>{copy.heading}</span>
                </p>
                <p className="text-lg md:text-xl text-slate-500 mb-4 leading-relaxed max-w-2xl">
                    {copy.lead}
                </p>
                {/* The guides are the top of this funnel: someone who does not
                    yet know the format needs them before a timed paper. */}
                <p className="mb-10">
                    <Link
                        to={copy.guidePath}
                        className="text-sm font-semibold underline underline-offset-4"
                        style={{ color: '#4E77B4' }}
                    >
                        {copy.guideLabel} →
                    </Link>
                </p>

                {isLoading && <p className="text-slate-500">Loading…</p>}

                {!isLoading && allGroups.length === 0 && (
                    <p className="text-slate-500">
                        No diagnostics are available just yet — check back soon.
                    </p>
                )}

                {picking && allGroups.length > 0 && (
                    <ModulePicker
                        initial={esat.modules}
                        onChoose={(modules) => {
                            esat.choose(modules)
                            setShowAll(false)
                            setChanging(false)
                        }}
                        onShowAll={() => {
                            setShowAll(true)
                            setChanging(false)
                        }}
                        onCancel={
                            esat.modules !== null
                                ? () => setChanging(false)
                                : undefined
                        }
                    />
                )}

                {!picking && (
                    <>
                        {test === 'esat' && allGroups.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
                                <span className="text-slate-500">
                                    {chosen ? 'Sitting:' : 'Showing all five modules.'}
                                </span>
                                {chosen &&
                                    ESAT_MODULES.filter((m) =>
                                        chosen.includes(m.key)
                                    ).map((m) => (
                                        <span
                                            key={m.key}
                                            className="rounded-full px-3 py-0.5 text-[13px] font-semibold"
                                            style={{ backgroundColor: '#EEF3FB', color: '#4E77B4' }}
                                        >
                                            {m.label}
                                        </span>
                                    ))}
                                <button
                                    type="button"
                                    onClick={() => setChanging(true)}
                                    className="ml-1 font-semibold underline underline-offset-4 cursor-pointer"
                                    style={{ color: '#4E77B4' }}
                                >
                                    {chosen ? 'Change' : 'Choose my modules'}
                                </button>
                            </div>
                        )}

                        {passTests.map((t) => (
                            <PassBanner
                                key={t}
                                test={t}
                                canBuy={canBuy}
                                seasons={billing?.seasons ?? []}
                                onUnlock={() => {
                                    const first = groups
                                        .flatMap((g) => g.sets)
                                        .find(
                                            (s) =>
                                                !s.isFree &&
                                                testFromSubject(s.subject) === t
                                        )
                                    if (first) toStartScreen(first)
                                }}
                            />
                        ))}

                        {groups.map((group) => (
                            <ModuleBlock
                                key={group.subject}
                                group={group}
                                coverage={coverage}
                                coveredTests={coveredTests}
                                canBuy={canBuy}
                                onOpen={toStartScreen}
                            />
                        ))}
                    </>
                )}

                {test !== undefined && (
                    <p className="text-sm text-slate-500 mb-4 mt-8">
                        Preparing for the other test?{' '}
                        <Link
                            to={
                                test === 'esat'
                                    ? '/diagnostics/tmua'
                                    : '/diagnostics/esat'
                            }
                            className="font-semibold text-slate-700 underline underline-offset-4"
                        >
                            {test === 'esat'
                                ? 'TMUA diagnostics'
                                : 'ESAT diagnostics'}{' '}
                            →
                        </Link>
                    </p>
                )}

                {!signedIn && (
                    <p className="text-xs text-slate-400 mt-2">
                        You&apos;ll be asked to sign in before you start — your
                        report is saved to your account.
                    </p>
                )}
            </div>
        </LandingLayout>
    )
}

/**
 * "Which modules are you sitting?" Maths 1 is always in, because every
 * candidate sits it; the student adds one or two more. Choosing a third extra
 * swaps out the oldest, so the form can never be stuck full.
 */
function ModulePicker({
    initial,
    onChoose,
    onShowAll,
    onCancel,
}: {
    initial: EsatModule[] | null
    onChoose: (modules: EsatModule[]) => void
    onShowAll: () => void
    /** Present when there is an earlier choice to go back to. */
    onCancel?: () => void
}) {
    const [extras, setExtras] = useState<EsatModule[]>(
        (initial ?? []).filter((m) => m !== 'maths_1')
    )
    const modules: EsatModule[] = ['maths_1', ...extras]
    const valid = isValidChoice(modules)

    const toggle = (key: EsatModule) =>
        setExtras((current) => {
            if (current.includes(key)) return current.filter((m) => m !== key)
            const next = [...current, key]
            return next.length > MAX_EXTRA_MODULES ? next.slice(1) : next
        })

    return (
        <section className="mb-10" aria-labelledby="module-picker-heading">
            <h2 id="module-picker-heading" className="text-xl font-bold mb-1">
                Which modules are you sitting?
            </h2>
            <p className="text-sm text-slate-500 mb-5">
                Everyone sits Maths 1. Pick the others your course needs —
                usually two, sometimes one. You can change this any time.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
                {ESAT_MODULES.map((m) => {
                    const fixed = m.key === 'maths_1'
                    const on = fixed || extras.includes(m.key)
                    return (
                        <button
                            key={m.key}
                            type="button"
                            role="checkbox"
                            aria-checked={on}
                            aria-disabled={fixed}
                            onClick={fixed ? undefined : () => toggle(m.key)}
                            className={`relative text-left rounded-xl border-[1.5px] p-3.5 ${
                                fixed ? 'cursor-default' : 'cursor-pointer'
                            }`}
                            style={
                                on
                                    ? { borderColor: '#4E77B4', backgroundColor: '#EEF3FB' }
                                    : { borderColor: '#e5e9f0', backgroundColor: '#fff' }
                            }
                        >
                            <span className="block font-bold text-[15px]">{m.label}</span>
                            <span className="block text-xs text-slate-500">
                                {fixed ? 'Everyone sits this' : ' '}
                            </span>
                            {on && (
                                <span
                                    aria-hidden
                                    className="absolute top-2.5 right-3 font-extrabold"
                                    style={{ color: '#4E77B4' }}
                                >
                                    ✓
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <Button
                    className="cursor-pointer"
                    disabled={!valid}
                    onClick={() => onChoose(modules)}
                >
                    Show my papers →
                </Button>
                {onCancel && (
                    <Button variant="outline" className="cursor-pointer" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
            </div>
            <p className="mt-5 text-sm text-slate-500">
                Not sure which modules?{' '}
                <Link
                    to="/guides/esat-practice-tests"
                    className="font-semibold underline underline-offset-4"
                    style={{ color: '#4E77B4' }}
                >
                    See what each course needs
                </Link>
                {' · '}
                <button
                    type="button"
                    onClick={onShowAll}
                    className="font-semibold underline underline-offset-4 cursor-pointer"
                    style={{ color: '#4E77B4' }}
                >
                    Show all five modules
                </button>
            </p>
        </section>
    )
}

/**
 * The one place a page mentions the Season Pass, for one test.
 *
 * Unlocking goes to a paid paper's start screen rather than straight to
 * checkout: the start screen shows sample questions and the sign-in wall, and
 * has room to set out what the pass includes.
 */
function PassBanner({
    test,
    canBuy,
    seasons,
    onUnlock,
}: {
    test: DiagnosticTest
    canBuy: boolean
    seasons: SeasonOffer[]
    onUnlock: () => void
}) {
    const offer = seasons.find((s) => s.test === test)
    const price = offer
        ? formatSeasonPrice(offer.priceAmount, offer.priceCurrency)
        : null
    const name = test === 'esat' ? 'ESAT' : 'TMUA'
    return (
        <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3.5 mb-6 text-sm"
            style={{ backgroundColor: '#EEF3FB', borderColor: '#CFDDF1' }}
        >
            <span>
                The papers marked 🔒 come with the{' '}
                <strong style={{ color: '#4E77B4' }}>{name} Season Pass</strong>.
            </span>
            {canBuy ? (
                <Button
                    className="cursor-pointer"
                    onClick={() => {
                        trackEvent('unlock_clicked', {
                            metadata: { source: 'catalogue', season: offer?.key ?? null },
                        })
                        onUnlock()
                    }}
                >
                    {price ? `Unlock · ${price} →` : 'Unlock with Season Pass →'}
                </Button>
            ) : (
                <Button variant="outline" disabled>
                    Season Pass — coming soon
                </Button>
            )}
        </div>
    )
}

/**
 * One module: the free papers to start with, then every full paper as a tile.
 *
 * The paper length is said once, in the header, since every full paper in a
 * module is the same length. A mini's length is on its own card, because it
 * differs by test (15 minutes for ESAT, 19 for TMUA).
 */
function ModuleBlock({
    group,
    coverage,
    coveredTests,
    canBuy,
    onOpen,
}: {
    group: Group
    coverage: Map<string, CoverageRow>
    coveredTests: string[]
    canBuy: boolean
    onOpen: (set: PublishedDiagnosticSet) => void
}) {
    const test = testFromSubject(group.subject)
    // A set whose subject names no test cannot be matched to a pass. The
    // server refuses it too, so showing it locked is the honest rendering.
    const unlocked = test !== undefined && coveredTests.includes(test)
    const minis = group.sets.filter(isMini)
    const full = group.sets
        .filter((s) => !isMini(s))
        .sort((a, b) => setLetter(a).localeCompare(setLetter(b), undefined, { numeric: true }))
    const starters = [...minis, ...full.filter((s) => s.isFree)]
    const sample = full[0]
    const state = (s: PublishedDiagnosticSet) => stateFor(s, coverage.get(s.id), unlocked)
    // The paper to suggest next: the first one they can open and have not.
    const nextId = full.find((s) => state(s).kind === 'start')?.id

    const open = (s: PublishedDiagnosticSet) => {
        if (state(s).kind === 'locked' && canBuy) {
            trackEvent('unlock_clicked', {
                metadata: { source: 'catalogue_tile', season: null },
            })
        }
        onOpen(s)
    }

    return (
        <section className="border border-slate-200 rounded-2xl p-5 mb-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3.5">
                <h2 className="text-lg font-bold">{moduleName(group.subject)}</h2>
                {sample && (
                    <span className="text-[13px] text-slate-500">
                        Full paper: {sample.questionCount} questions ·{' '}
                        {sample.timeLimitMinutes} min
                    </span>
                )}
            </div>

            {starters.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-2.5 mb-4">
                    {starters.map((s) => {
                        const st = state(s)
                        return (
                            <div
                                key={s.id}
                                className="flex items-center justify-between gap-3 border border-slate-200 rounded-xl px-3.5 py-3"
                            >
                                <div>
                                    <p className="text-sm font-bold">
                                        {isMini(s) ? 'Mini test' : `Set ${setLetter(s)}`}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {isMini(s)
                                            ? `${s.questionCount} questions · ${s.timeLimitMinutes} min`
                                            : 'Full paper'}
                                        {s.isFree ? ' · free' : ''}
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    variant={st.kind === 'done' ? 'outline' : 'default'}
                                    className="cursor-pointer whitespace-nowrap"
                                    onClick={() => open(s)}
                                    aria-label={`${s.title}: ${describe(st)}`}
                                >
                                    {st.kind === 'done'
                                        ? `✓ ${st.label}`
                                        : st.kind === 'resume'
                                          ? 'Resume →'
                                          : st.kind === 'locked'
                                            ? '🔒 Unlock'
                                            : 'Start →'}
                                </Button>
                            </div>
                        )
                    })}
                </div>
            )}

            {full.length > 0 && (
                <>
                    <p className="text-xs font-semibold text-slate-500 mb-2">Full papers</p>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                        {full.map((s) => {
                            const st = state(s)
                            const next = s.id === nextId
                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => open(s)}
                                    aria-label={`${s.title}: ${describe(st)}`}
                                    title={s.title}
                                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center cursor-pointer font-bold text-[17px] ${
                                        st.kind === 'locked' ? 'text-slate-400' : ''
                                    }`}
                                    style={
                                        st.kind === 'done'
                                            ? { borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }
                                            : st.kind === 'locked'
                                              ? { borderColor: '#e5e9f0', backgroundColor: '#f8fafc' }
                                              : next || st.kind === 'resume'
                                                ? { borderColor: '#4E77B4', borderWidth: 2, backgroundColor: '#fff' }
                                                : { borderColor: '#e5e9f0', backgroundColor: '#fff' }
                                    }
                                >
                                    {setLetter(s)}
                                    <span
                                        className="text-[10.5px] font-semibold mt-0.5"
                                        style={{
                                            color:
                                                st.kind === 'done'
                                                    ? '#16a34a'
                                                    : next || st.kind === 'resume'
                                                      ? '#4E77B4'
                                                      : '#64748b',
                                        }}
                                    >
                                        {st.kind === 'done'
                                            ? st.label
                                            : st.kind === 'resume'
                                              ? 'Resume'
                                              : st.kind === 'locked'
                                                ? '🔒'
                                                : next
                                                  ? 'Start'
                                                  : ' '}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </>
            )}
        </section>
    )
}

function describe(st: SetState): string {
    switch (st.kind) {
        case 'done':
            return `done, ${st.label}`
        case 'resume':
            return 'in progress, resume'
        case 'locked':
            return 'Season Pass'
        case 'start':
            return 'start'
    }
}
