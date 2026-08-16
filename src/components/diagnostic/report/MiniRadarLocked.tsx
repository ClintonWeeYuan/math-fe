import { Lock } from 'lucide-react'
import { frameworkFor } from '@/lib/diagnosticSkillFrameworks.ts'

type Props = {
    subject?: string | null
    /** The set's question count, so the copy names the real number rather
     * than assuming 27 — TMUA papers are 20. */
    fullPaperQuestions?: number
}

/**
 * What stands where the Skills Radar goes on a mini test's report.
 *
 * Deliberately NOT the Season Pass paywall. That card says "pay and you get
 * this", which on a mini is false however much a student pays — ten questions
 * put most axes on one or two items, so the chart would read 0%, 50% or 100%
 * and manufacture weaknesses that are not there. The honest statement is that
 * this needs a longer paper, not more money, and it happens to be the better
 * upsell: it points at the next rung of the ladder rather than at a checkout.
 *
 * The axes are shown named but greyed, because the specific thing being
 * withheld is more persuasive than a blank space — and naming them is only
 * possible now that Biology and Chemistry have frameworks at all.
 */
export function MiniRadarLocked({ subject, fullPaperQuestions = 27 }: Props) {
    const framework = frameworkFor(subject)
    const axes = Object.values(framework ?? {})

    return (
        <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <Lock className="h-4 w-4 text-slate-500" />
            </div>

            <div className="space-y-1">
                <p className="font-medium">
                    Your skills radar needs a full paper
                </p>
                <p className="mx-auto max-w-md text-sm text-slate-500 dark:text-slate-400">
                    Ten questions give an indication, not a diagnosis.{' '}
                    {fullPaperQuestions} questions resolve every axis properly.
                </p>
            </div>

            {axes.length > 0 && (
                <ul
                    // Presentational: the real content is the sentence above.
                    aria-hidden="true"
                    className="flex flex-wrap justify-center gap-x-3 gap-y-1"
                >
                    {axes.map((name) => (
                        <li
                            key={name}
                            className="text-xs text-slate-400 dark:text-slate-600"
                        >
                            {name}
                        </li>
                    ))}
                </ul>
            )}

            <p className="text-sm text-slate-500 dark:text-slate-400">
                Your score, per-question review and pacing above are the parts
                ten questions can measure — and they are yours free.
            </p>
        </div>
    )
}
