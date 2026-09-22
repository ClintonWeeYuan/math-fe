import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
    FEW_RATINGS,
    fetchPaperRatings,
    type PaperRatings,
} from '@/lib/paperRatingsApi.ts'

type Segment = { label: string; count: number; className: string }

/** Easier is amber, about right is green, harder is blue, so the two bars
 *  on a row read the same way round. "Not tried" is grey: it says nothing
 *  about the paper. */
const EASIER = 'bg-amber-400'
const RIGHT = 'bg-emerald-500'
const HARDER = 'bg-sky-500'
const NONE = 'bg-gray-300 dark:bg-gray-600'

function SplitBar({ title, segments }: { title: string; segments: Segment[] }) {
    const total = segments.reduce((n, s) => n + s.count, 0)
    return (
        <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-500">{title}</p>
            {total === 0 ? (
                <p className="text-sm text-gray-400">No answers yet</p>
            ) : (
                <>
                    <div
                        className="flex h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
                        role="img"
                        aria-label={segments.map((s) => `${s.label}: ${s.count}`).join(', ')}
                    >
                        {segments.map((s) =>
                            s.count > 0 ? (
                                <div
                                    key={s.label}
                                    className={s.className}
                                    style={{ width: `${(100 * s.count) / total}%` }}
                                />
                            ) : null
                        )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                        {segments
                            .filter((s) => s.count > 0)
                            .map((s) => `${s.label} ${s.count}`)
                            .join(' · ')}
                    </p>
                </>
            )}
        </div>
    )
}

function PaperRow({ paper }: { paper: PaperRatings }) {
    const few = paper.ratedAttempts < FEW_RATINGS
    return (
        <li className="flex flex-col gap-3 rounded-md border border-gray-200 p-4 dark:border-gray-800">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium">{paper.title}</span>
                <span className="text-sm text-gray-500">
                    {paper.ratedAttempts} {paper.ratedAttempts === 1 ? 'rating' : 'ratings'}
                    {few ? ' · too few to judge yet' : ''}
                </span>
            </div>
            <div className={`grid gap-4 sm:grid-cols-2 ${few ? 'opacity-60' : ''}`}>
                <SplitBar
                    title="How it felt"
                    segments={[
                        { label: 'Too easy', count: paper.feel.tooEasy, className: EASIER },
                        { label: 'About right', count: paper.feel.aboutRight, className: RIGHT },
                        { label: 'Too hard', count: paper.feel.tooHard, className: HARDER },
                    ]}
                />
                <SplitBar
                    title="Compared with real past papers"
                    segments={[
                        { label: 'Easier', count: paper.vsPastPapers.easier, className: EASIER },
                        { label: 'About the same', count: paper.vsPastPapers.similar, className: RIGHT },
                        { label: 'Harder', count: paper.vsPastPapers.harder, className: HARDER },
                        { label: "Haven't tried any", count: paper.vsPastPapers.notTried, className: NONE },
                    ]}
                />
            </div>
        </li>
    )
}

const TESTS = ['All', 'ESAT', 'TMUA'] as const

/**
 * Paper ratings: what students said on their report about how each paper
 * felt and how it compared with the real exam's past papers. Counts only,
 * never who said what; our own accounts are left out by the backend.
 */
export function PaperRatingsPage() {
    const [test, setTest] = useState<(typeof TESTS)[number]>('All')
    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin', 'paper-ratings'],
        queryFn: fetchPaperRatings,
    })
    const papers = (data?.papers ?? []).filter(
        (p) => test === 'All' || (p.subject ?? '').toUpperCase().startsWith(test)
    )

    return (
        <AdminLayout>
            <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Paper ratings</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        What students said on their report: how the paper felt, and how
                        it compared with real past papers. The second answer is the one
                        that says whether a paper is pitched at the real exam. Each
                        sitting counts once, with its latest answer, and our own
                        accounts are left out.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {TESTS.map((t) => (
                        <Button
                            key={t}
                            type="button"
                            size="sm"
                            variant={test === t ? 'default' : 'outline'}
                            aria-pressed={test === t}
                            onClick={() => setTest(t)}
                        >
                            {t}
                        </Button>
                    ))}
                    {data && (
                        <span className="ml-auto text-sm text-gray-500">
                            {data.totalRatedAttempts} rated{' '}
                            {data.totalRatedAttempts === 1 ? 'sitting' : 'sittings'} in all
                        </span>
                    )}
                </div>

                {isLoading && <p className="text-sm text-gray-500">Loading…</p>}
                {isError && (
                    <p className="text-sm text-red-600">Could not load the paper ratings.</p>
                )}
                {data && papers.length === 0 && (
                    <p className="text-sm text-gray-500">
                        No ratings yet. They appear here as students answer the card on
                        their report.
                    </p>
                )}

                <ul className="flex flex-col gap-3">
                    {papers.map((p) => (
                        <PaperRow key={p.setId} paper={p} />
                    ))}
                </ul>
            </div>
        </AdminLayout>
    )
}
