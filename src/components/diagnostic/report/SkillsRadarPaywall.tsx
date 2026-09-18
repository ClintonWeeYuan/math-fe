import { Check, Lock } from 'lucide-react'
import { frameworkFor, skillName } from '@/lib/diagnosticSkillFrameworks.ts'
import { SeasonChoice } from '@/components/billing/SeasonChoice.tsx'
import { testFromSubject } from '@/lib/diagnosticNextSteps.ts'
import type { SeasonOffer } from '@/lib/billingApi.ts'
import type { SkillScore } from '@/client'

type Props = {
    /** The set's subject, so the axis labels are this test's real skills. */
    subject?: string | null
    /** Opens checkout for one season. Wired once billing ships; omit — or
     *  pass no seasons — to render the card without any CTA. */
    onUnlock?: (seasonKey: string) => void
    /** The seasons on sale. Each button states its own end date and price;
     *  what is being sold is access until a date, and the point of sale is
     *  where that has to be said. */
    seasons?: SeasonOffer[]
    /** The one axis the free tier shows for real: the student's weakest
     *  measured skill, chosen server-side. Absent on older responses. */
    teaser?: SkillScore | null
    /** How many more papers this test's pass opens, for the card's list.
     *  Omitted while the catalogue is loading. */
    paidPaperCount?: number
}

/** Plausible-looking bar widths so the blurred shape reads as a real result
 * rather than an empty state. Deliberately not derived from the student's
 * data — the point of the free tier is that these numbers are withheld. */
const DECOY_WIDTHS = [82, 74, 66, 58, 47, 39, 31]

/**
 * The paywalled Skills Radar: the student's real skill axes are named, but
 * their scores are blurred behind an unlock card.
 *
 * Showing the true axis labels is the point — a student sees exactly which
 * skills were measured and that a specific diagnosis exists, which converts
 * far better than a generic lock. The scores themselves never reach the
 * browser: the report endpoint withholds them server-side for the free tier,
 * so this is a genuine gate and not a CSS trick.
 */
export function SkillsRadarPaywall({
    subject,
    onUnlock,
    seasons = [],
    teaser,
    paidPaperCount,
}: Props) {
    // Only the pass that opens this paper's test. The caller passes every
    // season on sale, which was the same thing until the passes were split by
    // test — after which a TMUA report offered the ESAT pass, and to anyone
    // holding it, offered it as "already covered by your pass" on a report
    // that pass does not open.
    const test = testFromSubject(subject)
    const offers = seasons.filter((s) => s.test === test)
    const testName = test === 'tmua' ? 'TMUA' : 'ESAT'
    // frameworkFor returns null for a subject we don't recognise; fall back
    // to no rows rather than crashing, so the unlock card still renders.
    const framework = frameworkFor(subject) ?? {}
    // The teaser's axis is shown for real above, so it is not repeated in
    // the blurred block beneath.
    const skills = Object.keys(framework)
        .filter((code) => code !== teaser?.skill)
        .slice(0, DECOY_WIDTHS.length)
    const teaserPercent =
        teaser?.score !== null && teaser?.score !== undefined
            ? Math.round(teaser.score * 100)
            : null

    return (
        <div className="flex flex-col gap-4">
            {teaser && teaserPercent !== null && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="mb-3 text-sm text-amber-900">
                        {teaserPercent === 100
                            ? `Free preview — you got every ${skillName(subject, teaser.skill)} question right. See how your other skills compare.`
                            : `Free preview — your weakest skill on this paper. You got ${teaser.correct} of ${teaser.attempted} right.`}
                    </p>
                    {/* Stacked on a phone: beside a 44-wide label the bar
                        had no room left to show anything. */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                        <span className="text-sm font-medium text-gray-900 sm:w-44 sm:shrink-0">
                            {skillName(subject, teaser.skill)}
                        </span>
                        <div className="flex flex-1 items-center gap-3">
                            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white">
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${Math.max(teaserPercent, 2)}%`,
                                        backgroundColor: '#D97706',
                                    }}
                                />
                            </div>
                            <span className="w-10 text-right text-sm font-medium text-gray-900">
                                {teaserPercent}%
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative min-h-[380px]">
                <div
                    className="flex flex-col gap-3 select-none"
                    aria-hidden="true"
                >
                    {skills.map((code, i) => (
                        <div key={code} className="flex items-center gap-4">
                            {/* Real name, crisp: this is what makes the lock
                                informative rather than frustrating. */}
                            <span className="w-44 shrink-0 text-sm text-gray-700">
                                {skillName(subject, code)}
                            </span>
                            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                                <div
                                    className="h-full rounded-full blur-[6px]"
                                    style={{
                                        width: `${DECOY_WIDTHS[i]}%`,
                                        backgroundColor: '#799ED1',
                                    }}
                                />
                            </div>
                            <span className="w-10 text-right text-sm text-gray-400 blur-[5px]">
                                00%
                            </span>
                        </div>
                    ))}
                </div>

                <div className="absolute inset-0 flex items-center justify-center bg-white/45">
                    <div className="mx-4 max-w-sm rounded-xl border bg-white p-6 shadow-lg">
                        <Lock
                            className="mx-auto mb-3 h-6 w-6"
                            style={{ color: '#4E77B4' }}
                        />
                        <p className="text-center font-semibold text-gray-900">
                            {teaser
                                ? 'See the rest of your diagnosis'
                                : 'Unlock your skill-by-skill diagnosis'}
                        </p>
                        {/* What the money buys, said plainly at the point of
                            sale rather than left to a page they never saw. */}
                        <ul className="mt-3 flex flex-col gap-1.5 text-sm text-gray-600">
                            <li className="flex gap-2">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                Your score on every skill, on this paper and
                                every one you sit
                            </li>
                            <li className="flex gap-2">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                The misconception behind each wrong answer
                            </li>
                            <li className="flex gap-2">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                {paidPaperCount
                                    ? `${paidPaperCount} more ${testName} papers to practise on`
                                    : `Every ${testName} paper to practise on`}
                            </li>
                        </ul>
                        {onUnlock !== undefined && offers.length > 0 && (
                            <div className="mt-4">
                                <SeasonChoice
                                    seasons={offers}
                                    onChoose={onUnlock}
                                    compact
                                />
                            </div>
                        )}
                        <p className="mt-3 text-center text-xs text-gray-400">
                            One payment, no subscription. Your score and timing
                            above stay free.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
