import { useQuery } from '@tanstack/react-query'
import { fetchSeasonPassHolders } from '@/lib/adminSeasonPassesApi.ts'

/** Every Season Pass holder with their per-paper progress. Admin-only. */
export default function useSeasonPassHoldersQuery() {
    return useQuery({
        queryKey: ['admin-season-passes'],
        queryFn: fetchSeasonPassHolders,
    })
}
