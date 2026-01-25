import { useQuery } from '@tanstack/react-query'
import { getCurrentUserUsersCurrentGet } from '@/client'

export function useGetCurrentUserQuery({ enabled }: { enabled: boolean }) {
    return useQuery({
        queryFn: async () => {
            const token = localStorage.getItem('token')
            if (token) {
                const response = await getCurrentUserUsersCurrentGet({
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                return response.data
            } else {
                return null
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
