import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import {
    EMAIL_CONSENT_QUERY_KEY,
    fetchEmailConsent,
    saveEmailConsent,
} from '@/lib/emailConsentApi.ts'

/**
 * The opt-in for the follow-up email, on a free full paper's report.
 *
 * Unticked until the student ticks it: the Privacy Policy promises marketing
 * only after a separate opt-in, and this email mentions the Season Pass. The
 * label is the backend's, so what is stored as consent is exactly what was
 * shown. Renders nothing until that label has loaded, rather than a box with
 * words that might not match the record.
 */
export function FollowupOptIn() {
    const queryClient = useQueryClient()
    const { data } = useQuery({
        queryKey: EMAIL_CONSENT_QUERY_KEY,
        queryFn: fetchEmailConsent,
        staleTime: 5 * 60_000,
    })
    const { mutate, isPending } = useMutation({
        mutationFn: (optedIn: boolean) => saveEmailConsent(optedIn, 'report'),
        onSuccess: (saved) => {
            queryClient.setQueryData(EMAIL_CONSENT_QUERY_KEY, saved)
            if (saved.optedIn) toast.success("Done — we'll email you tomorrow.")
        },
        onError: (err) => toast.error((err as Error).message),
    })

    if (!data) return null

    return (
        <Card>
            <CardContent className="pt-6">
                <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
                    <Checkbox
                        className="mt-0.5"
                        checked={data.optedIn}
                        disabled={isPending}
                        onCheckedChange={(v) => mutate(v === true)}
                    />
                    <span>{data.wording}</span>
                </label>
            </CardContent>
        </Card>
    )
}
