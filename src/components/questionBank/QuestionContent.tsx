import { useEffect, useRef } from 'react'
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
            <TextQuestion
                question={question}
                onDimensionChange={onDimensionChange}
                onClick={onClick}
                showOptions={showOptions}
            />
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
 * A text question, reporting its own rendered height.
 *
 * The card it sits in is a flip card: both faces are absolutely positioned, so
 * the card must be given an explicit height, and it takes that height from
 * whatever the question content reports. Only the iframe ever reported one, so
 * a text question left the card at its 250px default and the stem, diagram and
 * options simply overflowed past the bottom — over the pagination beneath it.
 *
 * A ResizeObserver rather than a one-off measurement because the height is not
 * settled at first paint: the options arrive from their own request, KaTeX
 * re-lays the stem out once it renders, and the diagram has to load before it
 * takes up space.
 */
function TextQuestion({
    question,
    onDimensionChange,
    onClick,
    showOptions,
}: {
    question: QuestionResponse
    onDimensionChange?: (height: number, width: number) => void
    onClick: () => void
    showOptions: boolean
}) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const element = ref.current
        if (!element || !onDimensionChange) return

        const report = () =>
            onDimensionChange(element.scrollHeight, element.scrollWidth)

        report()
        const observer = new ResizeObserver(report)
        observer.observe(element)
        return () => observer.disconnect()
    }, [onDimensionChange])

    return (
        <div ref={ref} onClick={onClick}>
            <LatexText text={question.stem ?? ''} />
            {question.diagramUrl && (
                // self-start + object-contain: an <img> that is a direct flex
                // child otherwise stretches to fill the cross axis, which
                // distorts every diagram.
                //
                // Sized by its own intrinsic dimensions: no explicit width or
                // height utility. These diagrams are SVGs carrying a viewBox
                // and no width/height attributes, and forcing `w-auto` on top
                // of that is what made them resolve to nothing. max-h caps a
                // tall diagram — a heating curve is nearly square and would
                // otherwise push the options out of view — and shrinks the
                // width with it, so the aspect ratio is never distorted.
                <img
                    src={question.diagramUrl}
                    alt=""
                    // onLoad as well as the observer: an image that has not
                    // loaded occupies no space, so the height measured before
                    // it arrives is wrong.
                    onLoad={() =>
                        ref.current &&
                        onDimensionChange?.(
                            ref.current.scrollHeight,
                            ref.current.scrollWidth
                        )
                    }
                    className="mt-3 max-w-full max-h-[320px] object-contain"
                />
            )}
            {showOptions && <TextQuestionOptions questionId={question.id} />}
        </div>
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
