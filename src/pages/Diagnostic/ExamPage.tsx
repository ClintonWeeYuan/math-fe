import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LoadingPage } from '@/components/common/FullLoadingPage.tsx'
import { Button } from '@/components/ui/button.tsx'
import { QuestionNavigator } from '@/components/diagnostic/exam/QuestionNavigator.tsx'
import { QuestionPane } from '@/components/diagnostic/exam/QuestionPane.tsx'
import { AttemptClosedView } from '@/components/diagnostic/exam/AttemptClosedView.tsx'
import useGetAttemptStateQuery from '@/hooks/diagnostic/useGetAttemptStateQuery.ts'
import useUpsertResponseMutation from '@/hooks/diagnostic/useUpsertResponseMutation.ts'

/**
 * The exam screen. Owns the single source of truth (the attempt-state
 * query) and the one piece of genuinely-local view state (currentIndex —
 * a pointer into the questions array, which can't drift from server data
 * because it isn't server data). Switches on attempt.status: in_progress
 * renders the question UI; any terminal status renders AttemptClosedView.
 * A reload of this URL re-runs the query and rehydrates — the reconnect
 * path (§7).
 */
export function ExamPage() {
    const { attemptId } = useParams()
    const navigate = useNavigate()
    const [currentIndex, setCurrentIndex] = useState(0)

    const { data: state, isLoading, isError } = useGetAttemptStateQuery({
        attemptId: attemptId ?? '',
    })
    const { mutate: upsertResponse } = useUpsertResponseMutation({
        attemptId: attemptId ?? '',
    })

    if (isLoading) return <LoadingPage />

    if (isError || !state) {
        return (
            <div className="mx-auto mt-16 flex max-w-md flex-col items-center gap-4 text-center">
                <h1 className="text-2xl font-semibold">Attempt not available</h1>
                <p className="text-gray-600">
                    This attempt couldn&apos;t be loaded. It may not exist or may
                    not be yours.
                </p>
                <Button variant="outline" onClick={() => navigate('/')}>
                    Back to home
                </Button>
            </div>
        )
    }

    // Terminal states (submitted / timed_out / abandoned) render the closed
    // view rather than the question UI — the same switch PR 2's timer and
    // the 409-on-write handler both flip into.
    if (state.attempt.status !== 'in_progress') {
        return <AttemptClosedView attempt={state.attempt} />
    }

    const questions = state.questions
    const responseByQuestionId = new Map(
        state.responses.map((r) => [r.questionId, r])
    )
    const boundedIndex = Math.min(currentIndex, questions.length - 1)
    const currentQuestion = questions[boundedIndex]
    const currentResponse = responseByQuestionId.get(currentQuestion.id)

    function handleAnswer(label: string) {
        // No-op if unchanged — clicking the already-selected option
        // shouldn't fire a redundant write (radios don't deselect here).
        if (currentResponse?.selectedOption === label) return
        upsertResponse({
            questionId: currentQuestion.id,
            body: { selectedOption: label },
        })
    }

    function handleToggleFlag() {
        upsertResponse({
            questionId: currentQuestion.id,
            body: { isFlagged: !(currentResponse?.isFlagged ?? false) },
        })
    }

    return (
        <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-8 px-4 md:grid-cols-[1fr_220px]">
            <div className="flex flex-col gap-6">
                <QuestionPane
                    question={currentQuestion}
                    response={currentResponse}
                    questionNumber={boundedIndex + 1}
                    totalQuestions={questions.length}
                    onAnswer={handleAnswer}
                    onToggleFlag={handleToggleFlag}
                />

                <div className="flex items-center justify-between border-t pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={boundedIndex === 0}
                        onClick={() => setCurrentIndex(boundedIndex - 1)}
                    >
                        Previous
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={boundedIndex === questions.length - 1}
                        onClick={() => setCurrentIndex(boundedIndex + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>

            <aside className="md:sticky md:top-8 md:self-start">
                <QuestionNavigator
                    questions={questions}
                    responses={state.responses}
                    currentIndex={boundedIndex}
                    onJump={setCurrentIndex}
                />
            </aside>
        </div>
    )
}
