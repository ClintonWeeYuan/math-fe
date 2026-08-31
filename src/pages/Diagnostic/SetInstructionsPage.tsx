import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LoadingPage } from '@/components/common/FullLoadingPage.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import useGetSetPreviewQuery from '@/hooks/diagnostic/useGetSetPreviewQuery.ts'
import useStartOrResumeAttemptMutation from '@/hooks/diagnostic/useStartOrResumeAttemptMutation.ts'
import { toast } from 'sonner'
import { BILLING_LIVE, formatSeasonPrice } from '@/lib/billing.ts'
import { useAuth } from '@/components/auth/AuthContext.tsx'
import { samplesFor } from '@/content/diagnosticSamples.mjs'
import { Link } from 'react-router-dom'
import useBillingStatusQuery from '@/hooks/billing/useBillingStatusQuery.ts'
import useStartCheckoutMutation from '@/hooks/billing/useStartCheckoutMutation.ts'
import { SeasonChoice } from '@/components/billing/SeasonChoice.tsx'
import type { SeasonOffer } from '@/lib/billingApi.ts'

/**
 * Landing/instructions screen (§2), before an attempt exists. Shows the
 * set's time limit and question count, and the agreement checkbox that
 * gives the traceability layer (§5, Stage 7) its contractual basis.
 * "Start" calls the idempotent start-or-resume endpoint and navigates to
 * the stable attempt URL — so a student who already has an in_progress
 * attempt for this set is dropped straight back into it, clock still
 * ticking (§7).
 */
export function SetInstructionsPage() {
    const { setId } = useParams()
    const navigate = useNavigate()
    const [agreed, setAgreed] = useState(false)
    const { user, isLoading: isAuthLoading } = useAuth()

    const {
        data: preview,
        isLoading,
        isError,
    } = useGetSetPreviewQuery({
        setId: setId ?? '',
    })
    const { mutate: startAttempt, isPending } =
        useStartOrResumeAttemptMutation()
    const { mutate: startCheckout, isPending: isCheckoutPending } =
        useStartCheckoutMutation()

    // Only when it can change what this page offers — signed out, or with
    // billing off, the answer cannot alter the button.
    const { data: billing } = useBillingStatusQuery({
        enabled: BILLING_LIVE,
        signedIn: user !== null,
    })
    const hasPass = billing?.hasPass === true
    // What is on sale right now. Empty before billing ships and once both
    // windows have passed — checkout would 409 in that state anyway.
    const seasons = BILLING_LIVE ? (billing?.seasons ?? []) : []

    function handleStart() {
        if (!setId) return
        startAttempt(
            { diagnosticSetId: setId, agreedToTerms: agreed },
            {
                onSuccess: (state) => {
                    if (state)
                        navigate(`/diagnostic/attempts/${state.attempt.id}`)
                },
                onError: (err) => {
                    // 402 = premium set without a Season Pass. Telling the
                    // student to "try again" would be a lie: retrying can
                    // never work, so say what is actually needed.
                    if ((err as { status?: number }).status === 402) {
                        if (BILLING_LIVE) {
                            // Reachable even with the CTA below rendering
                            // correctly — a pass can expire between the page
                            // loading and the click. No season is named: which
                            // one to buy is the student's choice, and the
                            // chooser is already on this page.
                            toast.error(
                                'This paper is part of the Season Pass — choose a sitting below to unlock it.'
                            )
                            return
                        }
                        toast.error(
                            'This paper is part of the Season Pass, which launches soon. Set A is free to sit now.'
                        )
                        return
                    }
                    toast.error(
                        'Could not start the diagnostic. Please try again.'
                    )
                },
            }
        )
    }

    if (isLoading) return <LoadingPage />

    if (isError || !preview) {
        return (
            <div className="mx-auto mt-16 flex max-w-md flex-col items-center gap-4 text-center">
                <h1 className="text-2xl font-semibold">
                    Diagnostic not available
                </h1>
                <p className="text-gray-600">
                    This diagnostic doesn&apos;t exist or isn&apos;t currently
                    published.
                </p>
                <Button variant="outline" onClick={() => navigate('/')}>
                    Back to home
                </Button>
            </div>
        )
    }

    // Narrowed rather than typed: `format` postdates the generated client, and
    // regenerating it here would drag a whole generator-version migration into
    // a change about one page. Absent, this reads as a full paper.
    const isMini = (preview as { format?: 'mini' | 'full' }).format === 'mini'
    // Narrowed for the same reason as `format` and `subject` above: the
    // generated client predates the field. Absent, a set reads as free —
    // which shows "Start", and the server still refuses a paid one with a
    // 402 that the handler below turns into an unlock.
    const isFree = (preview as { isFree?: boolean }).isFree !== false
    // The Season Pass stands between this student and this paper.
    const needsPass = !isFree && !hasPass

    return (
        <div className="mx-auto mt-12 flex max-w-2xl flex-col gap-6 px-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-semibold">{preview.title}</h1>
                {preview.description && (
                    <p className="text-gray-600">{preview.description}</p>
                )}
            </div>

            <Card>
                <CardContent className="grid grid-cols-2 gap-4 pt-6">
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500">
                            Time limit
                        </span>
                        <span className="text-xl font-medium">
                            {preview.timeLimitMinutes} minutes
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Questions</span>
                        <span className="text-xl font-medium">
                            {preview.questionCount}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Said before committing, not discovered afterwards. A mini's
                report has no Skills Radar, and a student who expected one
                would read its absence as something withheld — which is
                exactly the impression the report screen works to avoid. */}
            {isMini && (
                <div className="rounded-md border bg-emerald-50 border-emerald-200 px-4 py-3 text-sm text-emerald-900">
                    A mini test is the real paper&apos;s pace at a quarter of
                    its length — {preview.questionCount} questions in{' '}
                    {preview.timeLimitMinutes} minutes. You&apos;ll get your
                    score, a per-question review naming the misconception behind
                    each wrong answer, and your pacing. Ten questions give an
                    indication, not a diagnosis: the full paper is what resolves
                    every skill.
                </div>
            )}

            <div className="rounded-md border bg-amber-50 border-amber-200 px-4 py-3 text-sm text-amber-900">
                Once you start, the timer runs continuously and cannot be paused
                — the clock keeps going even if you close the tab. Make sure you
                can finish in one sitting.
            </div>

            {/* Signed out, the page stops here: sample questions so a
                visitor can judge the paper, then the wall. The timer runs
                once and cannot be paused, and the report has to persist, so
                sitting it genuinely needs an account — but meeting a login
                form with nothing behind it gave nobody a reason to make one. */}
            {!isAuthLoading && user === null ? (
                <SignInToSit
                    minutes={preview.timeLimitMinutes}
                    isMini={isMini}
                    // A paid paper needs more than an account, and the
                    // catalogue has already promised "Unlock with Season
                    // Pass" to get them here. Saying only "sign in to start"
                    // would spring the price on them one screen later.
                    seasons={isFree ? [] : seasons}
                    // The generated client predates this field. Regenerating
                    // it here would pull in a whole generator-version
                    // migration — 15 files — into a change about one page, so
                    // it is read narrowly until the client is regenerated on
                    // its own.
                    subject={(preview as { subject?: string | null }).subject}
                />
            ) : (
                <>
                    <label className="flex items-start gap-3 text-sm">
                        <Checkbox
                            checked={agreed}
                            onCheckedChange={(v) => setAgreed(v === true)}
                            className="mt-0.5"
                        />
                        <span>
                            I agree not to reproduce, share, or distribute any
                            of this diagnostic&apos;s content. This is also in
                            our{' '}
                            {/* Opens in a new tab deliberately: this screen is
                                the last step before a timed attempt starts, and
                                navigating away from it to read the terms should
                                not cost someone their place. */}
                            <a
                                href="/terms"
                                target="_blank"
                                rel="noreferrer"
                                className="underline underline-offset-4"
                            >
                                Terms of Use
                            </a>
                            .
                        </span>
                    </label>

                    <div>
                        {needsPass ? (
                            /* A paid paper this student does not own. Starting
                               it can only ever 402, so the button says what
                               actually has to happen instead of failing and
                               then explaining. The agreement checkbox does not
                               gate this one: they are being asked to buy, not
                               to sit, and the checkbox is about conduct during
                               an attempt that has not begun. */
                            <div className="flex flex-col gap-3">
                                <p className="text-sm text-gray-600">
                                    This paper is part of the Season Pass.
                                    {seasons.length > 1
                                        ? ' Pick the sitting you’re preparing for — the January pass covers October too.'
                                        : ''}
                                </p>
                                {seasons.length > 0 ? (
                                    <SeasonChoice
                                        seasons={seasons}
                                        isPending={isCheckoutPending}
                                        onChoose={(season) =>
                                            startCheckout({ season })
                                        }
                                    />
                                ) : (
                                    /* Nothing on sale: an unlock CTA would
                                       dead-end, so say so rather than imply a
                                       purchase path exists. */
                                    <Button
                                        type="button"
                                        size="lg"
                                        className="self-start"
                                        variant="outline"
                                        disabled
                                    >
                                        Season Pass — coming soon
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <Button
                                type="button"
                                size="lg"
                                disabled={!agreed || isPending}
                                onClick={handleStart}
                            >
                                {isPending
                                    ? 'Starting…'
                                    : isMini
                                      ? 'Start mini test'
                                      : 'Start diagnostic'}
                            </Button>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

/**
 * What a signed-out visitor sees instead of the start button.
 *
 * The samples are written for this page rather than taken from the set —
 * those 27 are the scored instrument, and publishing any of them would let a
 * student meet a question before sitting it.
 */
function SignInToSit({
    subject,
    minutes,
    isMini,
    seasons,
}: {
    subject?: string | null
    /** On-sale seasons, when this paper is behind the Season Pass. Empty for
     *  a free paper, or when there is nothing on sale. */
    seasons: SeasonOffer[]
    /** This paper's real time limit. Was hardcoded as 40, which is right for
     * an ESAT module and wrong for a 15-minute mini and a 75-minute TMUA
     * paper. */
    minutes: number
    isMini: boolean
}) {
    const navigate = useNavigate()
    const samples = samplesFor(subject)

    return (
        <>
            {samples && (
                <div className="flex flex-col gap-3">
                    <p className="text-sm text-gray-600">
                        Two questions in the style of this paper, so you can see
                        what it asks before committing {minutes} minutes.
                    </p>
                    {samples.questions.map((question) => (
                        <Card key={question.stem}>
                            <CardContent className="pt-6">
                                <p className="mb-3">{question.stem}</p>
                                <div className="flex flex-col gap-2">
                                    {question.options.map((option, i) => (
                                        <div
                                            key={option}
                                            className="rounded-md border px-3 py-2 text-sm"
                                        >
                                            {String.fromCharCode(65 + i)}
                                            &nbsp;&nbsp;{option}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    <p className="text-sm text-gray-500">
                        These two are worked through in full in the{' '}
                        <Link
                            to={samples.guidePath}
                            className="underline underline-offset-2"
                        >
                            guide
                        </Link>
                        .{' '}
                        {isMini
                            ? 'The mini itself is marked automatically, with a report naming the misconception behind each wrong answer.'
                            : 'The paper itself is marked automatically, with a report naming the skills to work on.'}
                    </p>
                </div>
            )}

            <Card>
                <CardContent className="flex flex-col gap-3 pt-6">
                    <p className="text-lg font-medium">
                        {isMini ? 'Sit the mini test' : 'Sit the full paper'}
                    </p>
                    <p className="text-sm text-gray-600">
                        The timer runs once and cannot be paused, so we save
                        your place and your report to an account.
                    </p>
                    {seasons.length > 0 && (
                        <div className="rounded-md border bg-slate-50 px-3 py-2 text-sm text-gray-600">
                            This paper is part of the Season Pass:{' '}
                            {seasons
                                .map((season) => {
                                    const price = formatSeasonPrice(
                                        season.priceAmount,
                                        season.priceCurrency
                                    )
                                    return price
                                        ? `${season.label} ${price}`
                                        : season.label
                                })
                                .join(' or ')}
                            . You&apos;ll pick a sitting after signing in.
                        </div>
                    )}
                    <div>
                        <Button
                            type="button"
                            size="lg"
                            onClick={() =>
                                navigate('/auth/login', {
                                    state: {
                                        from: { pathname: location.pathname },
                                    },
                                })
                            }
                        >
                            Sign in to start
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
