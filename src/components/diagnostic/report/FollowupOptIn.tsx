import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import {
    EMAIL_CONSENT_QUERY_KEY,
    fetchEmailConsent,
    saveEmailConsent,
} from '@/lib/emailConsentApi.ts'

/**
 * The ask for the follow-up email, the day after a free full paper.
 *
 * Opt-in, because the Privacy Policy promises marketing only after a separate
 * opt-in and this email mentions the Season Pass. It used to be an unticked
 * box, and by 15 October 2026 five of 218 students had ticked it. So it is
 * now a question with two answers, asked in two places: on the report, and
 * once in the questions after the paper (`compact`).
 *
 * The backend's wording is shown verbatim under the question, so what is
 * stored as the record of consent is exactly what the student agreed to.
 * Renders nothing until that wording has loaded. "No thanks" records nothing:
 * they never opted in, so there is nothing to withdraw.
 */
export function FollowupOptIn({
    source = 'report',
    compact = false,
}: {
    /** Where the ask was, stored with the consent. */
    source?: string
    /** The short form used inside the post-paper questions. */
    compact?: boolean
}) {
    const queryClient = useQueryClient()
    const [declined, setDeclined] = useState(false)
    // Whether they said yes here, so the compact ask can confirm rather than
    // vanish the moment the answer saves.
    const [saidYes, setSaidYes] = useState(false)
    const { data } = useQuery({
        queryKey: EMAIL_CONSENT_QUERY_KEY,
        queryFn: fetchEmailConsent,
        staleTime: 5 * 60_000,
    })
    const { mutate, isPending } = useMutation({
        mutationFn: (optedIn: boolean) => saveEmailConsent(optedIn, source),
        onSuccess: (saved) => {
            queryClient.setQueryData(EMAIL_CONSENT_QUERY_KEY, saved)
            if (saved.optedIn) setSaidYes(true)
        },
        onError: (err) => toast.error((err as Error).message),
    })

    if (!data || declined) return null
    // Already said yes somewhere else: the short ask has nothing to add.
    if (compact && data.optedIn && !saidYes) return null

    const question = 'Want a short email about this paper tomorrow?'

    if (data.optedIn) {
        const done = "Done — we'll email you tomorrow about this paper."
        if (compact) {
            return <p className="text-sm text-emerald-700">✓ {done}</p>
        }
        return (
            <Card>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6 text-sm">
                    <p className="text-emerald-700">✓ {done}</p>
                    <button
                        type="button"
                        disabled={isPending}
                        onClick={() => {
                            setSaidYes(false)
                            mutate(false)
                        }}
                        className="cursor-pointer text-slate-500 underline underline-offset-4 hover:text-slate-700"
                    >
                        Stop this email
                    </button>
                </CardContent>
            </Card>
        )
    }

    const body = (
        <>
            <p className={compact ? 'mb-1 text-sm font-medium' : 'font-medium'}>
                {question}
            </p>
            <p className="mb-3 text-sm text-slate-600">{data.wording}</p>
            <div className="flex flex-wrap gap-2">
                <Button
                    size={compact ? 'sm' : 'default'}
                    disabled={isPending}
                    onClick={() => mutate(true)}
                    className="cursor-pointer"
                >
                    Yes, email me tomorrow
                </Button>
                <Button
                    size={compact ? 'sm' : 'default'}
                    variant="outline"
                    disabled={isPending}
                    onClick={() => setDeclined(true)}
                    className="cursor-pointer"
                >
                    No thanks
                </Button>
            </div>
        </>
    )

    if (compact) return <div>{body}</div>
    return (
        <Card>
            <CardContent className="pt-6">{body}</CardContent>
        </Card>
    )
}
