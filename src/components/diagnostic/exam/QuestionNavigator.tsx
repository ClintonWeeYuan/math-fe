import type {
    DiagnosticResponseState,
    StudentDiagnosticQuestionResponse,
} from '@/client'
import { cn } from '@/lib/utils.ts'

type Props = {
    questions: StudentDiagnosticQuestionResponse[]
    responses: DiagnosticResponseState[]
    currentIndex: number
    onJump: (index: number) => void
}

/**
 * Pure derivation from the shared attempt-state entry — no fetch, no local
 * state. Each cell's colour comes straight from the responses array, so an
 * optimistic answer/flag write re-colours the cell on the same render.
 * Standard CBT navigator: click any number to jump directly (free
 * navigation, §2), and the target renders its already-saved state because
 * both content and response come from the one source.
 */
export function QuestionNavigator({ questions, responses, currentIndex, onJump }: Props) {
    const byQuestionId = new Map(responses.map((r) => [r.questionId, r]))

    return (
        <div className="flex flex-col gap-3">
            <div className="grid grid-cols-5 gap-2">
                {questions.map((question, index) => {
                    const response = byQuestionId.get(question.id)
                    const answered =
                        response?.selectedOption !== undefined &&
                        response?.selectedOption !== null
                    const flagged = response?.isFlagged ?? false
                    const isCurrent = index === currentIndex

                    return (
                        <button
                            key={question.id}
                            type="button"
                            onClick={() => onJump(index)}
                            aria-label={`Question ${index + 1}${answered ? ', answered' : ', unanswered'}${flagged ? ', flagged' : ''}`}
                            aria-current={isCurrent ? 'true' : undefined}
                            className={cn(
                                'relative h-10 rounded-md border text-sm font-medium transition-colors',
                                answered
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                    : 'border-gray-200 bg-white text-gray-600',
                                isCurrent && 'ring-2 ring-offset-1 ring-blue-500'
                            )}
                        >
                            {index + 1}
                            {flagged && (
                                <span
                                    aria-hidden
                                    className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500"
                                />
                            )}
                        </button>
                    )
                })}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm border border-emerald-300 bg-emerald-50" />
                    Answered
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm border border-gray-200 bg-white" />
                    Unanswered
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    Flagged
                </span>
            </div>
        </div>
    )
}
