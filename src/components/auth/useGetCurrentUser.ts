import { useQuery } from '@tanstack/react-query'
import { getCurrentUserUsersCurrentGet } from '@/client'

export function useGetCurrentUserQuery({ enabled }: { enabled: boolean }) {
    return useQuery({
        queryFn: async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                return null
            }

            // The generated client is fetch-based with ThrowOnError=false, so
            // it RESOLVES on an HTTP error rather than throwing: a 401 arrives
            // as `data: undefined`, never as an exception. This used to sit in
            // a try/catch testing axios.isAxiosError, which could therefore
            // never fire — the stale token was never cleared, and returning
            // undefined made react-query reject the query ("Query data cannot
            // be undefined"). With refetchOnMount off and a 24h staleTime,
            // that left an expired session showing a permanent "Loading…"
            // instead of signing the student out.
            const { data, error, response } =
                await getCurrentUserUsersCurrentGet({
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

            if (response.status === 401) {
                // Stale/invalid token — clear it so we don't keep sending a
                // dead token on every future request.
                localStorage.removeItem('token')
                return null
            }

            if (error !== undefined || data === undefined) {
                // Any other failure (network, 500, ...) is a real error, not
                // "logged out" — let it surface as isError rather than
                // silently signing someone out of a working session.
                throw new Error('Could not load your account.')
            }

            return data
        },
        enabled,
        queryKey: ['current-user'],
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
        gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    })
}
