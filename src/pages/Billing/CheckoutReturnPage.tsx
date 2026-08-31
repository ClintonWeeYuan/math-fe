import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import useBillingStatusQuery from '@/hooks/billing/useBillingStatusQuery.ts'

/**
 * How long to keep waiting before switching to the "we have your payment,
 * it's still settling" message. Stripe's webhook normally arrives in under a
 * second; this is generous enough that hitting it means something is actually
 * wrong, and short enough that nobody watches a spinner wondering.
 */
const PATIENCE_MS = 25000

/**
 * Where Stripe sends a student after they pay.
 *
 * The important thing this page does NOT do is grant anything. Landing here
 * is a browser redirect: it can be forged, replayed, or never happen at all
 * if they close the tab at the wrong moment. The entitlement is written by
 * the webhook, server-side, and all this page does is wait for it to show up
 * and then say so.
 *
 * That means there is a real gap — usually under a second — between paying
 * and owning. Polling covers it. What the page must never do in that gap is
 * imply the payment failed, because it didn't.
 */
export function CheckoutReturnPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [params] = useSearchParams()
    // Present only when Stripe did the redirecting. Someone who typed the URL
    // in themselves gets the same polling, which will simply tell them
    // whether they hold a pass.
    const paid = params.get('session_id') !== null

    const [waitedTooLong, setWaitedTooLong] = useState(false)

    const { data, isError } = useBillingStatusQuery({
        signedIn: true,
        pollUntilPass: true,
    })
    const hasPass = data?.hasPass === true

    useEffect(() => {
        if (hasPass) return
        const timer = setTimeout(() => setWaitedTooLong(true), PATIENCE_MS)
        return () => clearTimeout(timer)
    }, [hasPass])

    // Every screen that renders differently for a pass holder — the report's
    // Skills Radar, the catalogue's locked cards, the results dashboard — is
    // showing a cached "no". Drop those once, on arrival, rather than asking
    // each page to know about billing.
    const invalidated = useRef(false)
    useEffect(() => {
        if (!hasPass || invalidated.current) return
        invalidated.current = true
        void queryClient.invalidateQueries({ queryKey: ['diagnostic-report'] })
        void queryClient.invalidateQueries({ queryKey: ['my-attempts'] })
    }, [hasPass, queryClient])

    if (hasPass) {
        return (
            <Shell title="You're in — Season Pass unlocked">
                <p className="text-gray-600">
                    Every paper is open, and your skill-by-skill breakdown is
                    unlocked on the reports you've already sat as well as the
                    ones ahead.
                </p>
                <div className="flex flex-wrap gap-3">
                    <Button onClick={() => navigate('/diagnostics')}>
                        Browse the papers
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/my-results')}
                    >
                        See my results
                    </Button>
                </div>
            </Shell>
        )
    }

    if (waitedTooLong || isError) {
        return (
            <Shell title="Payment received — still finalising">
                {/* Deliberately not phrased as a failure. The money has left
                    their account; what has not finished is our side of it,
                    and telling them it went wrong would send them to their
                    bank over something that will resolve itself. */}
                <p className="text-gray-600">
                    {paid
                        ? "Your payment went through. We're waiting on the confirmation that unlocks your pass — this usually takes a second, so it's worth a refresh."
                        : "We couldn't confirm a Season Pass on your account."}{' '}
                    If it still isn't showing in a few minutes, email{' '}
                    <a
                        className="underline underline-offset-4"
                        href="mailto:hello@jomexam.com"
                    >
                        hello@jomexam.com
                    </a>{' '}
                    and we'll sort it out.
                </p>
                <div className="flex flex-wrap gap-3">
                    <Button onClick={() => window.location.reload()}>
                        Check again
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/diagnostics')}
                    >
                        Back to the papers
                    </Button>
                </div>
            </Shell>
        )
    }

    return (
        <Shell title="Confirming your payment…">
            <p className="text-gray-600">
                This takes a moment. Please don&apos;t close this tab.
            </p>
        </Shell>
    )
}

function Shell({
    title,
    children,
}: {
    title: string
    children: React.ReactNode
}) {
    return (
        <div className="mx-auto mt-16 flex max-w-md flex-col gap-4 px-4">
            <Card>
                <CardContent className="flex flex-col gap-4 pt-6">
                    <h1 className="text-2xl font-semibold">{title}</h1>
                    {children}
                </CardContent>
            </Card>
        </div>
    )
}
