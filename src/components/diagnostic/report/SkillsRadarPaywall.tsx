import { Lock } from 'lucide-react'
import { frameworkFor, skillName } from '@/lib/diagnosticSkillFrameworks.ts'
import { SeasonChoice } from '@/components/billing/SeasonChoice.tsx'
import { testFromSubject } from '@/lib/diagnosticNextSteps.ts'
import type { SeasonOffer } from '@/lib/billingApi.ts'

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
export function SkillsRadarPaywall({ subject, onUnlock, seasons = [] }: Props) {
    // Only the pass that opens this paper's test. The caller passes every
    // season on sale, which was the same thing until the passes were split by
    // test — after which a TMUA report offered the ESAT pass, and to anyone
    // holding it, offered it as "already covered by your pass" on a report
    // that pass does not open.
    const test = testFromSubject(subject)
    const offers = seasons.filter((s) => s.test === test)
    // frameworkFor returns null for a subject we don't recognise; fall back
    // to no rows rather than crashing, so the unlock card still renders.
    const framework = frameworkFor(subject) ?? {}
    const skills = Object.keys(framework).slice(0, DECOY_WIDTHS.length)

    return (
        <div className="relative">
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
                <div className="mx-4 max-w-sm rounded-xl border bg-white p-6 text-center shadow-lg">
                    <Lock
                        className="mx-auto mb-3 h-6 w-6"
                        style={{ color: '#4E77B4' }}
                    />
                    <p className="font-semibold text-gray-900">
                        Unlock your skill-by-skill diagnosis
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                        See how you scored on each skill above, the
                        misconception behind every wrong answer, and the next
                        mock paper.
                    </p>
                    {onUnlock !== undefined && offers.length > 0 && (
                        <div className="mt-4">
                            <SeasonChoice
                                seasons={offers}
                                onChoose={onUnlock}
                                compact
                            />
                        </div>
                    )}
                    <p className="mt-3 text-xs text-gray-400">
                        Your score and timing above stay free.
                    </p>
                </div>
            </div>
        </div>
    )
}
