import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import { cn } from '@/lib/utils.ts'
import {
    PLAN_EMAIL_CONSENT_QUERY_KEY,
    fetchPlanEmailConsent,
    savePlanEmailConsent,
} from '@/lib/emailConsentApi.ts'

/**
 * The ask for the weekly plan email: each Monday until the student's sitting,
 * what to practise that week.
 *
 * Opt-in, because the email mentions the Season Pass, and asked as a question
 * with two answers, which is what finally got students answering the
 * follow-up email's ask. The backend's wording is shown verbatim, so what is
 * stored as consent is what the student read.
 *
 * Renders nothing until the email is switched on (`available`), so nobody
 * signs up for an email that is not being sent. "No thanks" records nothing.
 *
 * `compact` is the short form under the sitting question on the start screen;
 * the full form is a card on My results, which is also where it is turned off.
 */
export function WeeklyPlanOptIn({
    source,
    compact = false,
}: {
    source: string
    compact?: boolean
}) {
    const queryClient = useQueryClient()
    const [declined, setDeclined] = useState(false)
    const { data } = useQuery({
        queryKey: PLAN_EMAIL_CONSENT_QUERY_KEY,
        queryFn: fetchPlanEmailConsent,
        staleTime: 5 * 60_000,
        retry: false,
    })
    const { mutate, isPending } = useMutation({
        mutationFn: (optedIn: boolean) => savePlanEmailConsent(optedIn, source),
        onSuccess: (saved) => queryClient.setQueryData(PLAN_EMAIL_CONSENT_QUERY_KEY, saved),
        onError: (err) => toast.error((err as Error).message),
    })

    if (!data || !data.available || declined) return null

    const frame = compact
        ? 'mt-3 border-t border-slate-200 pt-3'
        : 'rounded-xl border border-slate-200 bg-white px-5 py-4 mb-10'

    if (data.optedIn) {
        return (
            <div className={cn(frame, 'text-sm text-slate-700')}>
                <p className={compact ? '' : 'font-medium'}>
                    Your weekly plan arrives each Monday until your sitting.
                </p>
                <button
                    type="button"
                    disabled={isPending}
                    onClick={() => mutate(false)}
                    className="mt-1 text-xs text-slate-500 underline underline-offset-4 hover:text-slate-700"
                >
                    Stop the weekly plan
                </button>
            </div>
        )
    }

    return (
        <div className={frame}>
            <p className={cn('font-medium', compact ? 'text-sm' : '')}>
                Want a short plan each Monday until your sitting?
            </p>
            <p className="mt-1 text-xs text-slate-500">{data.wording}</p>
            <div className="mt-2 flex gap-2">
                <Button
                    type="button"
                    size="sm"
                    className="cursor-pointer"
                    disabled={isPending}
                    onClick={() => mutate(true)}
                >
                    Yes, send it
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="cursor-pointer"
                    disabled={isPending}
                    onClick={() => setDeclined(true)}
                >
                    No thanks
                </Button>
            </div>
        </div>
    )
}
