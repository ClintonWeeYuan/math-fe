import { useQuery } from '@tanstack/react-query'
import { getQuestionsByPaperInstanceQuestionsPaperInstancePaperInstanceIdGet } from '@/client'

type Props = {
    paperInstanceId: string
}

export default function useGetQuestionsByPaperInstanceQuery({
    paperInstanceId,
}: Props) {
    return useQuery({
        queryFn: async () =>
            (
                await getQuestionsByPaperInstanceQuestionsPaperInstancePaperInstanceIdGet(
                    { path: { paper_instance_id: paperInstanceId } }
                )
            ).data,
        queryKey: ['question', paperInstanceId],
    })
}
