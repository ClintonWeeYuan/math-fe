import { useQuery } from '@tanstack/react-query'
import { adminOverviewAdminOverviewGet } from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'

/** Everything the admin landing page shows, in one request. */
export default function useAdminOverviewQuery() {
    return useQuery({
        queryKey: ['admin-overview'],
        queryFn: async () => {
            const result = await adminOverviewAdminOverviewGet({
                headers: getAuthHeaders(),
            })
            // The generated client resolves { data: undefined, error } rather
            // than throwing, so returning `.data` would render an empty
            // dashboard for a failed request — zeroes that look like facts.
            if (result.error !== undefined || result.data === undefined) {
                throw new Error('Could not load the overview.')
            }
            return result.data
        },
    })
}
