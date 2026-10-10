import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    REDEMPTION_QUEUE_QUERY_KEY,
    buildRedemptionSet,
} from '@/lib/redemption.ts'

/**
 * Asks for the next redemption sitting from one paper. The backend hands
 * back the sitting already waiting if there is one, so a double click
 * cannot build two. On success the queue is refetched: the group now has a
 * pending set, and its button should say "Continue" rather than "Redeem".
 *
 * Throws a DiagnosticApiError with the status, so the caller can tell a
 * 402 (paid paper, pass ended) from a 409 (still locked) from a failure.
 */
export default function useBuildRedemptionSetMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (sourceSetId: string) => buildRedemptionSet(sourceSetId),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: REDEMPTION_QUEUE_QUERY_KEY })
        },
    })
}
