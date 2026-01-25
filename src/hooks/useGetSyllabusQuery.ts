import { useQuery } from '@tanstack/react-query'
import { getSyllabusSyllabusSyllabusIdGet } from '@/client'

type Props = {
    syllabusId: string
}

export default function useGetSyllabusQuery({ syllabusId }: Props) {
    return useQuery({
        queryFn: async () =>
            (
                await getSyllabusSyllabusSyllabusIdGet({
                    path: { syllabus_id: syllabusId },
                })
            ).data,
        queryKey: ['syllabus', syllabusId],
    })
}
