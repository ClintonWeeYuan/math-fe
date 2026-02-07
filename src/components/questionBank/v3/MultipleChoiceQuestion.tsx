import type { QuestionResponse } from '@/client'
import useGetQuestionOptionQuery from '@/hooks/questionOptions/useGetQuestionOptionsQuery.ts'
import { MemoizedHtmlBlock } from '@/components/questionBank/HtmlBlock.tsx'

type Props = {
    question: QuestionResponse
}

export function MultipleChoiceQuestion({ question }: Props) {
    const { data: options } = useGetQuestionOptionQuery({
        questionId: question.id,
    })

    if (options === undefined) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-pulse text-gray-500">Loading options...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <MemoizedHtmlBlock src={question.questionUrl} onClick={() => {}} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((option, index) => (
                    <button
                        key={option.id}
                        className="group relative bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-400 rounded-xl p-6 text-left transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center font-semibold text-gray-600 group-hover:text-blue-600 transition-colors">
                                {String.fromCharCode(65 + index)}
                            </div>
                            <div className="flex-1 text-gray-700 group-hover:text-gray-900">
                                {option.value}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
