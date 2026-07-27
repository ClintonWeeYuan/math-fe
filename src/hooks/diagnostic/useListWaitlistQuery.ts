import { useQuery } from '@tanstack/react-query'
import { listWaitlistWaitlistGet } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

/**
 * Every waitlist signup, newest first — admin only (the endpoint requires an
 * admin token). Feeds the admin waitlist screen so signups can be read and
 * exported without hand-rolling an API call.
 */
export default function useListWaitlistQuery() {
    return useQuery({
        queryKey: ['waitlist-signups'],
        queryFn: async () =>
            (await listWaitlistWaitlistGet({ headers: getAuthHeaders() })).data,
    })
}
