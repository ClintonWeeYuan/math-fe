import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LoadingPage } from '@/components/common/FullLoadingPage.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import useGetSetPreviewQuery from '@/hooks/diagnostic/useGetSetPreviewQuery.ts'
import useStartOrResumeAttemptMutation from '@/hooks/diagnostic/useStartOrResumeAttemptMutation.ts'
import { toast } from 'sonner'
import { BILLING_LIVE } from '@/lib/billing.ts'

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

    const { data: preview, isLoading, isError } = useGetSetPreviewQuery({
        setId: setId ?? '',
    })
    const { mutate: startAttempt, isPending } = useStartOrResumeAttemptMutation()

    function handleStart() {
        if (!setId) return
        startAttempt(
            { diagnosticSetId: setId, agreedToTerms: agreed },
            {
                onSuccess: (state) => {
                    if (state) navigate(`/diagnostic/attempts/${state.attempt.id}`)
                },
                onError: (err) => {
                    // 402 = premium set without a Season Pass. Telling the
                    // student to "try again" would be a lie: retrying can
                    // never work, so say what is actually needed.
                    if ((err as { status?: number }).status === 402) {
                        toast.error(
                            BILLING_LIVE
                                ? 'This paper is part of the Season Pass. Unlock it to sit this mock.'
                                : 'This paper is part of the Season Pass, which launches soon. Set A is free to sit now.'
                        )
                        return
                    }
                    toast.error('Could not start the diagnostic. Please try again.')
                },
            }
        )
    }

    if (isLoading) return <LoadingPage />

    if (isError || !preview) {
        return (
            <div className="mx-auto mt-16 flex max-w-md flex-col items-center gap-4 text-center">
                <h1 className="text-2xl font-semibold">Diagnostic not available</h1>
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
                        <span className="text-sm text-gray-500">Time limit</span>
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

            <div className="rounded-md border bg-amber-50 border-amber-200 px-4 py-3 text-sm text-amber-900">
                Once you start, the timer runs continuously and cannot be paused —
                the clock keeps going even if you close the tab. Make sure you can
                finish in one sitting.
            </div>

            <label className="flex items-start gap-3 text-sm">
                <Checkbox
                    checked={agreed}
                    onCheckedChange={(v) => setAgreed(v === true)}
                    className="mt-0.5"
                />
                <span>
                    I agree not to reproduce, share, or distribute any of this
                    diagnostic&apos;s content.
                </span>
            </label>

            <div>
                <Button
                    type="button"
                    size="lg"
                    disabled={!agreed || isPending}
                    onClick={handleStart}
                >
                    {isPending ? 'Starting…' : 'Start diagnostic'}
                </Button>
            </div>
        </div>
    )
}
