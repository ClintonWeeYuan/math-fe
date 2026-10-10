import { useQuery } from '@tanstack/react-query'
import {
    REDEMPTION_QUEUE_QUERY_KEY,
    fetchRedemptionQueue,
} from '@/lib/redemption.ts'

/**
 * The signed-in student's redemption queue, one group per paper.
 *
 * Empty for most students most of the time, and the results page renders
 * nothing for empty — so a failed load is also rendered as nothing rather
 * than as an error card, which would be the most prominent thing on the page
 * for a feature the student may never have heard of.
 */
export default function useRedemptionQueueQuery({ enabled = true } = {}) {
    return useQuery({
        queryKey: REDEMPTION_QUEUE_QUERY_KEY,
        queryFn: fetchRedemptionQueue,
        enabled,
        staleTime: 60_000,
    })
}
