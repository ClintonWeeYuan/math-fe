import { Card, CardContent } from '@/components/ui/card.tsx'
import { cn } from '@/lib/utils.ts'
import type { SubjectProgress } from '@/lib/myResults.ts'

/** "ESAT Physics — Diagnostic Set B" -> "Set B". */
function paperLabel(title: string): string {
    const set = title.match(/Set\s+([A-Z])\b/)
    return set ? `Set ${set[1]}` : title.replace(/^.*?[—–-]\s*/, '')
}

function moduleLabel(subject: string): string {
    // The same short name the coverage list uses.
    return subject.replace(/^(ESAT|TMUA)\s+/i, '')
}

/**
 * "Your progress": for each module with two or more full papers, the scores in
 * the order they were sat, and the change from the first to the latest. A
 * module with one paper gets a line saying what a second would show, which is
 * the reason to come back that this page did not give before.
 */
export function ProgressSection({ progress }: { progress: SubjectProgress[] }) {
    const tracked = progress.filter((p) => p.points.length > 1)
    const single = progress.filter((p) => p.points.length === 1)
    if (progress.length === 0) return null

    return (
        <section className="mb-12" aria-labelledby="progress-heading">
            <h2 id="progress-heading" className="mb-1 text-xl font-medium">
                Your progress
            </h2>
            <p className="mb-4 text-sm text-slate-500">
                Your score on each full paper, in the order you sat them. Papers
                differ in difficulty, so look at the trend rather than one step.
            </p>
            <div className="flex flex-col gap-3">
                {tracked.map((p) => (
                    <Card key={p.subject}>
                        <CardContent className="flex flex-col gap-3 pt-5">
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <p className="font-medium">{moduleLabel(p.subject)}</p>
                                {p.change !== null && (
                                    <p
                                        className={cn(
                                            'text-sm font-medium',
                                            p.change > 0
                                                ? 'text-emerald-700'
                                                : p.change < 0
                                                  ? 'text-amber-700'
                                                  : 'text-slate-600'
                                        )}
                                    >
                                        {p.change > 0
                                            ? `Up ${p.change} points since your first paper`
                                            : p.change < 0
                                              ? `Down ${-p.change} points since your first paper`
                                              : 'Level with your first paper'}
                                    </p>
                                )}
                            </div>
                            <ol className="flex flex-wrap items-end gap-3" aria-label={`${moduleLabel(p.subject)} scores in order`}>
                                {p.points.map((point) => (
                                    <li key={point.attemptId} className="flex w-14 flex-col items-center gap-1">
                                        <span className="text-xs font-medium text-slate-700">
                                            {point.pct}%
                                        </span>
                                        <span
                                            aria-hidden="true"
                                            className="w-6 rounded-t bg-slate-700"
                                            style={{ height: `${Math.max(4, point.pct * 0.6)}px` }}
                                        />
                                        <span className="text-xs text-slate-500">
                                            {paperLabel(point.setTitle)}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {single.length > 0 && (
                <p className="mt-3 text-sm text-slate-600">
                    {tracked.length > 0 ? 'Also: s' : 'S'}it a second full paper in{' '}
                    {single.map((p) => moduleLabel(p.subject)).join(', ')} and
                    you&apos;ll see how your score moves.
                </p>
            )}
        </section>
    )
}
