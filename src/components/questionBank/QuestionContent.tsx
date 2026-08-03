import type { QuestionResponse } from '@/client'
import { MemoizedHtmlBlock } from '@/components/questionBank/HtmlBlock.tsx'
import { LatexText } from '@/components/diagnostic/LatexText.tsx'
import useGetQuestionOptionQuery from '@/hooks/questionOptions/useGetQuestionOptionsQuery.ts'

/**
 * A question has a stem when it was authored as text, and a questionUrl when it
 * came from the converter as HTML. Deciding on what a question actually *has*,
 * rather than on a type flag, means a question can't claim to be one kind and
 * be stored as the other.
 */
export function isTextQuestion(question: QuestionResponse): boolean {
    return Boolean(question.stem)
}

/**
 * The options of a text question, fetched by id.
 *
 * Options live in their own table and their own endpoint, which is how the
 * quiz already reads them; react-query caches per question id, so a card that
 * re-renders or gets revisited doesn't refetch.
 */
function TextQuestionOptions({ questionId }: { questionId: string }) {
    const { data: options } = useGetQuestionOptionQuery({ questionId })

    if (!options?.length) return null

    return (
        <ol className="mt-3 space-y-1">
            {[...options]
                .sort((a, b) => a.position - b.position)
                .map((option, index) => (
                    <li key={option.id} className="flex gap-2 text-sm">
                        <span className="font-semibold shrink-0">
                            {/* Fall back to position for options created before
                                labels existed — they were entered one at a time
                                from the admin UI, where order was the only
                                thing distinguishing them. */}
                            {option.label ?? String.fromCharCode(65 + index)}.
                        </span>
                        <LatexText text={option.value} />
                    </li>
                ))}
        </ol>
    )
}

/**
 * Renders a question's stem, whichever kind it is — the 1,074 past-paper
 * questions as converted HTML in an iframe, and authored questions as text
 * with their options inline.
 */
export function QuestionContent({
    question,
    onDimensionChange,
    onClick,
    showOptions = true,
}: {
    question: QuestionResponse
    onDimensionChange?: (height: number, width: number) => void
    onClick: () => void
    /**
     * False where the caller lays out the options itself as answer buttons —
     * the quiz does, and would otherwise show every option twice.
     */
    showOptions?: boolean
}) {
    if (isTextQuestion(question)) {
        return (
            <div onClick={onClick}>
                <LatexText text={question.stem ?? ''} />
                {question.diagramUrl && (
                    // self-start + object-contain: an <img> that is a direct
                    // flex child otherwise stretches to fill the cross axis,
                    // which distorts every diagram.
                    <img
                        src={question.diagramUrl}
                        alt=""
                        className="mt-3 self-start object-contain max-w-full"
                    />
                )}
                {showOptions && <TextQuestionOptions questionId={question.id} />}
            </div>
        )
    }

    if (!question.questionUrl) return null

    return (
        <MemoizedHtmlBlock
            src={question.questionUrl}
            onDimensionChange={onDimensionChange}
            onClick={onClick}
        />
    )
}

/**
 * The answer side. A text question has no answer asset — its answer is the
 * option letter flagged correct, not a worked solution.
 */
export function QuestionAnswer({
    question,
    onClick,
}: {
    question: QuestionResponse
    onClick: () => void
}) {
    if (isTextQuestion(question)) {
        return (
            <div className="text-center" onClick={onClick}>
                <p className="text-4xl font-semibold">
                    {question.correctOption ?? '—'}
                </p>
            </div>
        )
    }

    if (!question.answerUrl) return null

    return <MemoizedHtmlBlock src={question.answerUrl} onClick={onClick} />
}
