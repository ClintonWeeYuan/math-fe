import { useQuery } from '@tanstack/react-query'

import { getAllSyllabusSyllabusGet } from '@/client'

export default function useGetAllSyllabusQuery() {
    return useQuery({
        queryFn: async () => (await getAllSyllabusSyllabusGet()).data,
        queryKey: ['syllabus'],
    })
}
