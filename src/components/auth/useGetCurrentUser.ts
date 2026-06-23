import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { getCurrentUserUsersCurrentGet } from '@/client'

export function useGetCurrentUserQuery({ enabled }: { enabled: boolean }) {
    return useQuery({
        queryFn: async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                return null
            }

            try {
                const response = await getCurrentUserUsersCurrentGet({
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                return response.data
            } catch (error) {
                if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 401
                ) {
                    // Stale/invalid token - clear it so we don't keep
                    // sending a dead token on every future request.
                    localStorage.removeItem('token')
                    return null
                }
                // Any other failure (network, 500, etc.) is a real error,
                // not "logged out" - let it surface as isError.
                throw error
            }
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
