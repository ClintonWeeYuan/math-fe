import { useMutation } from '@tanstack/react-query'
import { getHintChatHintPost } from '@/client'

type Props = {
    onSuccess: () => void
}
export default function useGenerateHintMutation({ onSuccess }: Props) {
    return useMutation({
        mutationFn: async ({
            question,
            questionId,
        }: {
            question: string
            questionId: string
        }) =>
            await getHintChatHintPost({
                body: {
                    question,
                    questionId,
                },
            }),
        onSuccess,
    })
}
