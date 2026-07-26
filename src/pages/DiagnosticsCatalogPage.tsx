import { Link, useNavigate } from 'react-router-dom'
import { Seo } from '@/components/Seo.tsx'
import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { Button } from '@/components/ui/button.tsx'
import useListPublishedSetsQuery from '@/hooks/diagnostic/useListPublishedSetsQuery.ts'
import type { DiagnosticTest } from '@/hooks/diagnostic/useListPublishedSetsQuery.ts'
import type { PublishedDiagnosticSet } from '@/client'

/** Group published sets by subject, subjects sorted, uncategorised last. */
function groupBySubject(
    sets: PublishedDiagnosticSet[]
): { subject: string; sets: PublishedDiagnosticSet[] }[] {
    const by = new Map<string, PublishedDiagnosticSet[]>()
    for (const s of sets) {
        const key = s.subject ?? 'Other'
        const list = by.get(key)
        if (list) list.push(s)
        else by.set(key, [s])
    }
    return [...by.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([subject, subjectSets]) => ({ subject, sets: subjectSets }))
}

type Props = {
    /** Show one admissions test's catalogue; omit for the combined page. */
    test?: DiagnosticTest
}

/** Per-test page copy — ESAT and TMUA are separate products, so each gets
 * its own heading, blurb and search metadata rather than sharing one. */
const COPY: Record<
    'all' | DiagnosticTest,
    { lead: string; heading: string; title: string; description: string; path: string }
> = {
    all: {
        heading: 'diagnostics.',
        lead: 'Sit a timed diagnostic and get a report mapped to specific skills — so you know exactly where to focus. Pick a paper to begin.',
        title: 'Diagnostic Tests | JomExam',
        description:
            'Sit a timed ESAT or TMUA diagnostic and get a report mapped to specific skills, so you know exactly where you stand before you start prepping.',
        path: '/diagnostics',
    },
    esat: {
        heading: 'ESAT diagnostics.',
        lead: 'Timed ESAT papers — Mathematics 1, Mathematics 2 and Physics — each mapped to the skills the test examines. Sit one and see exactly where you stand.',
        title: 'ESAT Practice Tests & Diagnostics | JomExam',
        description:
            'Free timed ESAT diagnostics for Mathematics 1, Mathematics 2 and Physics. Sit a paper under exam conditions and get a skills report showing exactly where to focus.',
        path: '/diagnostics/esat',
    },
    tmua: {
        heading: 'TMUA diagnostics.',
        lead: 'Timed TMUA papers — Paper 1 (Applications of Mathematical Knowledge) and Paper 2 (Mathematical Reasoning) — mapped to the skills each paper examines.',
        title: 'TMUA Practice Tests & Diagnostics | JomExam',
        description:
            'Free timed TMUA diagnostics for Paper 1 and Paper 2. Sit a paper under exam conditions and get a skills report showing exactly where to focus.',
        path: '/diagnostics/tmua',
    },
}

/**
 * Public diagnostics catalogue: published sets grouped by subject, each card
 * linking to its start screen. Browsing is open to anyone; starting an
 * attempt still routes through login (the start screen is protected).
 * Rendered per test (/diagnostics/esat, /diagnostics/tmua) and combined
 * (/diagnostics), so each admissions test has a page of its own.
 */
export function DiagnosticsCatalogPage({ test }: Props) {
    const navigate = useNavigate()
    const copy = COPY[test ?? 'all']

    const { data: sets, isLoading } = useListPublishedSetsQuery(test)
    const groups = groupBySubject(sets ?? [])

    return (
        <LandingLayout>
            <Seo
                title={copy.title}
                description={copy.description}
                path={copy.path}
            />
            <div className="px-4 md:px-[50px] xl:px-[150px] py-12 md:py-20 max-w-4xl">
                <p className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                    Free{' '}
                    <span style={{ color: '#799ED1' }}>{copy.heading}</span>
                </p>
                <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed max-w-2xl">
                    {copy.lead}
                </p>

                {isLoading && <p className="text-slate-500">Loading…</p>}

                {!isLoading && groups.length === 0 && (
                    <p className="text-slate-500">
                        No diagnostics are available just yet — check back soon.
                    </p>
                )}

                {groups.map((group) => (
                    <section key={group.subject} className="mb-10">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-4">
                            {group.subject}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {group.sets.map((s) => (
                                <div
                                    key={s.id}
                                    className="bg-slate-50 border border-slate-100 rounded-xl p-6 flex flex-col"
                                >
                                    <p className="text-lg font-bold mb-1">{s.title}</p>
                                    <p className="text-sm text-slate-500 mb-4">
                                        {s.questionCount} questions ·{' '}
                                        {s.timeLimitMinutes} min
                                        {s.isFree ? ' · free' : ''}
                                    </p>
                                    {s.description && (
                                        <p className="text-sm text-slate-500 leading-relaxed mb-4">
                                            {s.description}
                                        </p>
                                    )}
                                    <div className="mt-auto">
                                        <Button
                                            className="cursor-pointer"
                                            onClick={() =>
                                                navigate(`/diagnostic/sets/${s.id}`)
                                            }
                                        >
                                            Start diagnostic →
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

                {test !== undefined && (
                    <p className="text-sm text-slate-500 mb-4">
                        Preparing for the other test?{' '}
                        <Link
                            to={test === 'esat' ? '/diagnostics/tmua' : '/diagnostics/esat'}
                            className="font-semibold text-slate-700 underline underline-offset-4"
                        >
                            {test === 'esat' ? 'TMUA diagnostics' : 'ESAT diagnostics'} →
                        </Link>
                    </p>
                )}

                <p className="text-xs text-slate-400 mt-2">
                    You&apos;ll be asked to sign in before you start — your report is
                    saved to your account.
                </p>
            </div>
        </LandingLayout>
    )
}
