import { useQuery } from '@tanstack/react-query'
import { fetchBillingStatus, type BillingStatus } from '@/lib/billingApi.ts'

/** How often the return page re-asks whether the pass has landed. */
const POLL_MS = 2000

type Props = {
    /** Turn the query off entirely (e.g. before billing ships). */
    enabled?: boolean
    /** Whether anyone is signed in. Decides which endpoint answers: the
     *  personalised one, or the public price list. Signed out is a real
     *  answer here, not a reason to skip the call — a visitor deciding
     *  whether to make an account needs to see what a pass costs. */
    signedIn?: boolean
    /**
     * Poll until a pass appears, then stop. Only the post-checkout return
     * page wants this: the entitlement is written by Stripe's webhook rather
     * than by the redirect, so there is a short window after paying in which
     * the answer is still "no". Everywhere else asks once.
     */
    pollUntilPass?: boolean
}

/**
 * What is on sale, and whether the signed-in student already owns a pass.
 *
 * One shared cache entry (`['billing-status']`) so the catalogue, the report
 * and the post-checkout return page all agree — and so invalidating it once,
 * after a purchase, updates every one of them.
 *
 * Not retried on failure: this decides between "buy" and "you own this", and
 * the safe answer when we cannot tell is to show the buy path, which the
 * server refuses anyway for someone who already holds a pass.
 */
export default function useBillingStatusQuery({
    enabled = true,
    signedIn = false,
    pollUntilPass = false,
}: Props = {}) {
    return useQuery<BillingStatus>({
        // Keyed on signed-in-ness: the two endpoints return the same shape but
        // not the same answer, and a cache shared between them would show a
        // freshly signed-in student the anonymous "you own nothing".
        queryKey: ['billing-status', signedIn],
        queryFn: () => fetchBillingStatus(signedIn),
        enabled,
        retry: false,
        // Stops itself once the answer is yes, rather than leaving a timer
        // running on a page the student may sit on.
        refetchInterval: pollUntilPass
            ? (query) => (query.state.data?.hasPass ? false : POLL_MS)
            : false,
    })
}
