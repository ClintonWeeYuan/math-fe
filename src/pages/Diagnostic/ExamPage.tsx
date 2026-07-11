import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LoadingPage } from '@/components/common/FullLoadingPage.tsx'
import { Button } from '@/components/ui/button.tsx'
import { QuestionNavigator } from '@/components/diagnostic/exam/QuestionNavigator.tsx'
import { QuestionPane } from '@/components/diagnostic/exam/QuestionPane.tsx'
import { AttemptClosedView } from '@/components/diagnostic/exam/AttemptClosedView.tsx'
import { ExamTimer } from '@/components/diagnostic/exam/ExamTimer.tsx'
import { ReviewDialog } from '@/components/diagnostic/exam/ReviewDialog.tsx'
import useGetAttemptStateQuery from '@/hooks/diagnostic/useGetAttemptStateQuery.ts'
import useUpsertResponseMutation from '@/hooks/diagnostic/useUpsertResponseMutation.ts'
import useSubmitAttemptMutation from '@/hooks/diagnostic/useSubmitAttemptMutation.ts'
import useEventCapture from '@/hooks/diagnostic/useEventCapture.ts'
import { summarizeResponses } from '@/lib/diagnosticResponseSummary.ts'

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
    const [reviewOpen, setReviewOpen] = useState(false)
    // Set only by the manual-submit path, so the enter/exit effect's
    // cleanup skips its own exit (already recorded + flushed explicitly
    // before the lock). Reset on submit failure so a failed manual submit
    // doesn't suppress subsequent navigation exits. The auto-submit path
    // never sets it — its cleanup exit still fires and lands within the
    // timed_out grace window.
    const examEndingRef = useRef(false)

    const { data: state, isLoading, isError } = useGetAttemptStateQuery({
        attemptId: attemptId ?? '',
    })
    const { mutate: upsertResponse } = useUpsertResponseMutation({
        attemptId: attemptId ?? '',
    })
    const { mutate: submitAttempt, isPending: isSubmitting } =
        useSubmitAttemptMutation({ attemptId: attemptId ?? '' })

    // Computed before the early returns so the event-capture hooks below
    // stay unconditional (rules of hooks). currentQuestionId is undefined
    // whenever the attempt isn't in_progress, so the enter/exit effect
    // naturally fires the final exit when the status flips to terminal.
    const inProgress = state?.attempt.status === 'in_progress'
    const questions = state?.questions ?? []
    const boundedIndex =
        questions.length > 0 ? Math.min(currentIndex, questions.length - 1) : 0
    const currentQuestionId =
        inProgress && questions.length > 0 ? questions[boundedIndex].id : undefined

    const { recordEvent, flush, flushBeforeSubmit } = useEventCapture({
        attemptId: attemptId ?? '',
        currentQuestionId,
    })

    // Declared BEFORE the enter/exit effect so, on a true unmount (leaving
    // the page), React runs the enter/exit cleanup first (recording the
    // final exit) and this forced keepalive flush second — sending it.
    useEffect(() => {
        return () => void flush({ force: true, keepalive: true })
    }, [flush])

    // enter on arrival (+ flush-on-navigation: the flush sends this enter
    // plus the previous question's exit recorded in the prior cleanup),
    // exit on leaving. Keyed on currentQuestionId so it fires on nav and on
    // the in_progress→terminal transition (currentQuestionId → undefined).
    useEffect(() => {
        if (currentQuestionId === undefined) return
        recordEvent(currentQuestionId, 'enter')
        void flush()
        return () => {
            // On a manual submit the final exit was already recorded and
            // flushed before the lock, so skip this one to avoid a
            // duplicate that would arrive post-lock (no grace) and fail.
            if (examEndingRef.current) return
            recordEvent(currentQuestionId, 'exit')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentQuestionId])

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

    const responseByQuestionId = new Map(
        state.responses.map((r) => [r.questionId, r])
    )
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
        recordEvent(currentQuestion.id, 'answer_change')
    }

    function handleToggleFlag() {
        const willBeFlagged = !(currentResponse?.isFlagged ?? false)
        upsertResponse({
            questionId: currentQuestion.id,
            body: { isFlagged: willBeFlagged },
        })
        recordEvent(currentQuestion.id, willBeFlagged ? 'flag' : 'unflag')
    }

    function handleExpire() {
        // Flush what's buffered promptly at exam-end so it lands while the
        // attempt is still in_progress (accepted outright); the final exit,
        // recorded when the status flips to timed_out, then lands within
        // the backend's 30s post-timeout grace via the periodic flush.
        void flush()
        submitAttempt()
    }

    async function handleManualSubmit() {
        // A manually-submitted attempt becomes 'submitted', which has NO
        // post-lock grace window (unlike timed_out) — so the final exit and
        // whatever else is buffered must land BEFORE the submit locks it.
        examEndingRef.current = true
        recordEvent(currentQuestion.id, 'exit')
        // Blocking, bounded-retry flush (distinct from the fire-and-forget
        // flushes everywhere else). We submit regardless of its result:
        // losing a few seconds of analytics must never trap a student
        // unable to finish their exam over an events-ingestion blip.
        await flushBeforeSubmit()
        submitAttempt(undefined, {
            onError: () => {
                // Submit failed — the attempt is still in_progress, so let
                // navigation exits resume being recorded.
                examEndingRef.current = false
            },
        })
    }

    const summary = summarizeResponses(questions, state.responses)

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

            <aside className="flex flex-col gap-4 md:sticky md:top-8 md:self-start">
                <ExamTimer
                    serverDeadlineAt={state.attempt.serverDeadlineAt}
                    onExpire={handleExpire}
                />
                <QuestionNavigator
                    questions={questions}
                    responses={state.responses}
                    currentIndex={boundedIndex}
                    onJump={setCurrentIndex}
                />
                <Button
                    type="button"
                    className="w-full"
                    onClick={() => setReviewOpen(true)}
                >
                    Finish exam
                </Button>
            </aside>

            <ReviewDialog
                open={reviewOpen}
                onOpenChange={setReviewOpen}
                summary={summary}
                onConfirm={handleManualSubmit}
                isSubmitting={isSubmitting}
            />
        </div>
    )
}
