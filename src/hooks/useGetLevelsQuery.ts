import { useQuery } from '@tanstack/react-query'
import { getAllLevelsLevelsGet } from '@/client'

export default function useGetLevelsQuery() {
    return useQuery({
        queryFn: async () => (await getAllLevelsLevelsGet()).data,
        queryKey: ['levels'],
    })
}
