import { useQuery } from '@tanstack/react-query'
import { client } from '@/client/client.gen'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import type { StudentAttempt } from '@/lib/myResults.ts'

/**
 * The signed-in student's own attempts, newest first.
 *
 * Called by hand rather than through the generated client because that client
 * has not been regenerated for this endpoint — regenerating rewrites ~1500
 * lines, which is a change of its own.
 *
 * `enabled` exists for the recommendations block, which renders for anyone
 * with a report open and must not fire an authenticated request when there is
 * no token to send.
 */
export default function useMyAttemptsQuery({ enabled = true } = {}) {
    return useQuery({
        queryKey: ['my-diagnostic-attempts'],
        enabled,
        queryFn: async (): Promise<StudentAttempt[]> => {
            const result = await client.get<{
                200: { attempts: StudentAttempt[] }
            }>({
                url: '/diagnostic/attempts',
                headers: getAuthHeaders(),
            })
            if (result.error !== undefined) {
                throw new Error('Failed to load your attempts.')
            }
            return result.data?.attempts ?? []
        },
    })
}
