import { useMutation } from '@tanstack/react-query'
import { createCheckoutSession } from '@/lib/billingApi.ts'
import { toast } from 'sonner'

type Variables = {
    /** Which season to buy: "oct-2026" | "jan-2027". Omitted, the backend
     *  assumes the soonest window still on sale. */
    season?: string
    /** Where Stripe returns an abandoning student. Defaults to the page they
     *  are on, which is almost always what you want. */
    returnPath?: string
}

/**
 * Start checkout: create the Session, then hand the browser to Stripe.
 *
 * The navigation happens here rather than in each caller so that no screen
 * can create a Session and forget to use it — an orphaned Session is a
 * student who clicked "unlock" and watched nothing happen.
 *
 * Errors are surfaced here too, because every caller wants the same thing
 * said. The two worth distinguishing: 409 means they already own the pass
 * (buying twice would charge for nothing), and 503 means billing isn't
 * configured on the server — a deployment mistake, not the student's.
 */
export default function useStartCheckoutMutation() {
    return useMutation({
        mutationFn: async ({ season, returnPath }: Variables = {}) => {
            const url = await createCheckoutSession(
                season,
                returnPath ??
                    (typeof window !== 'undefined'
                        ? window.location.pathname
                        : undefined)
            )
            // assign, not replace: the student should be able to come back
            // with the browser's back button if they change their mind on
            // Stripe's page.
            window.location.assign(url)
            return url
        },
        onError: (err) => {
            const status = (err as { status?: number }).status
            if (status === 409) {
                // Either they hold this exact season, or one that already runs
                // longer. The backend's own wording says which, and it is more
                // specific than anything worth writing here.
                toast.success(
                    (err as Error).message ||
                        'Your pass already covers this — reload to see it.'
                )
                return
            }
            if (status === 503) {
                toast.error(
                    "Payments aren't switched on yet. Please try again later."
                )
                return
            }
            toast.error(
                (err as Error).message || 'Could not start checkout.'
            )
        },
    })
}
