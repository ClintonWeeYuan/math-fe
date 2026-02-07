import { useQuery } from '@tanstack/react-query'
import { getQuestionOptionsQuestionsQuestionIdOptionsGet } from '@/client'

type Props = {
    questionId: string
}

export default function useGetQuestionOptionQuery({ questionId }: Props) {
    return useQuery({
        queryFn: async () =>
            (
                await getQuestionOptionsQuestionsQuestionIdOptionsGet({
                    path: {
                        question_id: questionId,
                    },
                })
            ).data,
        queryKey: ['options', questionId],
    })
}
