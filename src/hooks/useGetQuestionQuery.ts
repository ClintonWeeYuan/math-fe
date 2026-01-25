import { useQuery } from '@tanstack/react-query'

import { getQuestionQuestionsQuestionIdGet } from '@/client'

type Props = {
    questionId: string
}

export default function useGetQuestionQuery({ questionId }: Props) {
    return useQuery({
        queryFn: async () =>
            (
                await getQuestionQuestionsQuestionIdGet({
                    path: { question_id: questionId },
                })
            ).data,
        queryKey: ['question', questionId],
        refetchOnWindowFocus: false,
    })
}
