import type {
    DiagnosticResponseState,
    StudentDiagnosticQuestionResponse,
} from '@/client'
import { LatexText } from '@/components/diagnostic/LatexText.tsx'
import { Button } from '@/components/ui/button.tsx'
import { cn } from '@/lib/utils.ts'
import { Flag } from 'lucide-react'

type Props = {
    question: StudentDiagnosticQuestionResponse
    response: DiagnosticResponseState | undefined
    questionNumber: number
    totalQuestions: number
    onAnswer: (label: string) => void
    onToggleFlag: () => void
}

/**
 * Pure render of one question. The selected option and flag come straight
 * from the `response` prop (derived from the shared attempt-state entry) —
 * there is deliberately no per-question local state, so jumping to a
 * question always shows its persisted answer/flag, never a blank render,
 * regardless of how it was reached (Next/Prev or a direct navigator jump).
 * Uses the same LatexText component as the admin preview (§9's one shared
 * renderer). Diagram, when present, is a signed-URL <img>.
 */
export function QuestionPane({
    question,
    response,
    questionNumber,
    totalQuestions,
    onAnswer,
    onToggleFlag,
}: Props) {
    const selected = response?.selectedOption ?? null
    const flagged = response?.isFlagged ?? false

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                    Question {questionNumber} of {totalQuestions}
                </span>
                <Button
                    type="button"
                    variant={flagged ? 'default' : 'outline'}
                    size="sm"
                    onClick={onToggleFlag}
                    aria-pressed={flagged}
                >
                    <Flag className="h-4 w-4" />
                    {flagged ? 'Flagged' : 'Flag for review'}
                </Button>
            </div>

            <div className="text-lg leading-relaxed">
                <LatexText text={question.stem} />
            </div>

            {question.diagramUrl && (
                <div className="rounded-md border p-3 bg-gray-50">
                    <img
                        src={question.diagramUrl}
                        alt="Question diagram"
                        className="max-h-80"
                    />
                </div>
            )}

            <div
                role="radiogroup"
                aria-label="Answer options"
                className="flex flex-col gap-2"
            >
                {question.options.map((option) => {
                    const isSelected = selected === option.label
                    return (
                        <button
                            key={option.label}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => onAnswer(option.label)}
                            className={cn(
                                'flex items-start gap-3 rounded-md border px-4 py-3 text-left transition-colors',
                                isSelected
                                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                            )}
                        >
                            <span
                                className={cn(
                                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm font-semibold',
                                    isSelected
                                        ? 'border-blue-500 bg-blue-500 text-white'
                                        : 'border-gray-300 text-gray-600'
                                )}
                            >
                                {option.label}
                            </span>
                            <span className="pt-0.5">
                                <LatexText text={option.text} />
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
