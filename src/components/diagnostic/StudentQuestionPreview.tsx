import { LatexText } from '@/components/diagnostic/LatexText.tsx'
import type { DiagnosticQuestionResponse } from '@/client'

type Props = {
    question: DiagnosticQuestionResponse
}

/**
 * One question exactly as a student sees it during the exam — stem, diagram,
 * and options as selectable choices, with NO correct answer marked and NO
 * misconception shown. Deliberately the sanitized view (unlike the admin
 * review, which reveals the answer key): this is for checking what the
 * student will actually be presented with.
 *
 * Mirrors the exam's QuestionPane layout (§9's one shared LatexText
 * renderer), minus the interactivity — nothing is selectable here.
 */
export function StudentQuestionPreview({ question }: Props) {
    return (
        <div className="flex flex-col gap-4">
            <div className="text-lg leading-relaxed">
                <LatexText text={question.stem} />
            </div>

            {question.diagramUrl && (
                <div className="rounded-md border bg-gray-50 p-3">
                    <img
                        src={question.diagramUrl}
                        alt="Question diagram"
                        className="max-h-72"
                    />
                </div>
            )}

            <div className="flex flex-col gap-2">
                {question.options.map((option) => (
                    <div
                        key={option.label}
                        className="flex items-center gap-3 rounded-md border px-3 py-2"
                    >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-medium">
                            {option.label}
                        </span>
                        <span>
                            <LatexText text={option.text} />
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
