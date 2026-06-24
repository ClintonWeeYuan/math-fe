import { useQuery } from '@tanstack/react-query'
import { getTopicsBySubjectTopicsSubjectIdGet } from '@/client'

export default function useGetTopicsBySubjectQuery(subjectId: string) {
    return useQuery({
        queryFn: async () => {
            return (
                await getTopicsBySubjectTopicsSubjectIdGet({
                    path: { subject_id: subjectId },
                })
            ).data
        },
        queryKey: ['topics', subjectId],
        staleTime: 60 * 60 * 1000,
        refetchOnWindowFocus: false,
    })
}
