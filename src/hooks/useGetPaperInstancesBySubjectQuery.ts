import { useQuery } from '@tanstack/react-query'

import { getPaperInstancesBySubjectIdPapersInstanceSubjectSubjectIdGet } from '@/client'

type Props = {
    subjectId: string
}

export default function useGetPaperInstancesBySubjectQuery({
    subjectId,
}: Props) {
    return useQuery({
        queryFn: async () =>
            (
                await getPaperInstancesBySubjectIdPapersInstanceSubjectSubjectIdGet(
                    { path: { subject_id: subjectId } }
                )
            ).data,
        queryKey: ['paperInstance', subjectId],
    })
}
