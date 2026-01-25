import { useQuery } from '@tanstack/react-query'

import { getQuestionsByTopicQuestionsTopicsTopicIdGet } from '@/client'

type Props = {
    topicId: string
}

export default function useGetQuestionsByTopicQuery({ topicId }: Props) {
    return useQuery({
        queryFn: async () =>
            (
                await getQuestionsByTopicQuestionsTopicsTopicIdGet({
                    path: { topic_id: topicId },
                })
            ).data,
        queryKey: ['questions', topicId],
        refetchOnWindowFocus: false,
    })
}
