import { useQuery } from '@tanstack/react-query'
import { getSubjectSubjectsSubjectIdGet } from '@/client'

type Props = {
    subjectId: string
}

export type Paper = { id: string; name: string }

export default function useGetSubjectQuery({ subjectId }: Props) {
    return useQuery({
        queryFn: async () =>
            (
                await getSubjectSubjectsSubjectIdGet({
                    path: { subject_id: subjectId },
                })
            ).data,
        queryKey: ['subject'],
    })
}
