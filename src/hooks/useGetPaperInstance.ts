import { useQuery } from '@tanstack/react-query'
import { getPaperInstancePapersInstanceInstanceIdGet } from '@/client'

type Props = {
    paperInstanceId: string
}

export default function useGetPaperInstance({ paperInstanceId }: Props) {
    return useQuery({
        queryFn: async () =>
            (
                await getPaperInstancePapersInstanceInstanceIdGet({
                    path: {
                        instance_id: paperInstanceId,
                    },
                })
            ).data,
        queryKey: ['paperInstance'],
    })
}
