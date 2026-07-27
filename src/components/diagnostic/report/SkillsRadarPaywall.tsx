import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { frameworkFor, skillName } from '@/lib/diagnosticSkillFrameworks.ts'

type Props = {
    /** The set's subject, so the axis labels are this test's real skills. */
    subject?: string | null
    /** Opens checkout. Wired once billing ships; omit to render the CTA inert. */
    onUnlock?: () => void
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
export function SkillsRadarPaywall({ subject, onUnlock }: Props) {
    const framework = frameworkFor(subject)
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
                    {onUnlock !== undefined && (
                        <Button
                            className="mt-4 w-full cursor-pointer"
                            onClick={onUnlock}
                        >
                            Unlock full report →
                        </Button>
                    )}
                    <p className="mt-3 text-xs text-gray-400">
                        Your score and timing above stay free.
                    </p>
                </div>
            </div>
        </div>
    )
}
