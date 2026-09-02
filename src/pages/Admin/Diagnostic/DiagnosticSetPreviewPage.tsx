import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { LoadingPage } from '@/components/common/FullLoadingPage.tsx'
import { QuestionNavigator } from '@/components/diagnostic/exam/QuestionNavigator.tsx'
import { QuestionPane } from '@/components/diagnostic/exam/QuestionPane.tsx'
import usePreviewDiagnosticSetQuery from '@/hooks/diagnostic/usePreviewDiagnosticSetQuery.ts'
import type { DiagnosticResponseState } from '@/client'
import useStartOrResumeAttemptMutation from '@/hooks/diagnostic/useStartOrResumeAttemptMutation.ts'
import { toast } from 'sonner'

/**
 * The student's exam screen, driven by local state instead of an attempt.
 *
 * Reuses QuestionPane and QuestionNavigator — the components the real exam
 * renders — so what an admin checks here is what a student gets. A preview
 * built from its own markup would agree with the exam until the day someone
 * changed one of them.
 *
 * Answers and flags are kept in memory so the interaction can be tried;
 * nothing is sent anywhere, there is no timer, and there is nothing to
 * submit. Closing the tab leaves no trace.
 *
 * "Sit it timed" is the other half, and deliberately not a second preview
 * mode: it starts a real attempt through the same endpoint a student uses and
 * hands over to the real exam screen. Reimplementing the clock here would mean
 * rehearsing something no student ever sits, which is the one thing a dry run
 * must not do. The report at the end is the real report, for the same reason.
 */
export function DiagnosticSetPreviewPage() {
    const { setId } = useParams()
    const { data: set, isLoading, isError } = usePreviewDiagnosticSetQuery({
        setId: setId ?? '',
    })
    const [index, setIndex] = useState(0)
    const [responses, setResponses] = useState<DiagnosticResponseState[]>([])
    const navigate = useNavigate()
    const { mutate: startAttempt, isPending: isStarting } =
        useStartOrResumeAttemptMutation()

    function sitItTimed() {
        if (!setId) return
        // A plain confirm, matching the results table's bulk delete. The
        // warning is not ceremony: the clock starts server-side and cannot be
        // paused, and the set allows one attempt in progress at a time — so
        // walking away from a rehearsal blocks the next one until it times
        // out on its own.
        if (
            !confirm(
                'Start a real, timed attempt?\n\n' +
                    'The clock starts now and runs server-side — closing the ' +
                    'tab does not stop it. This creates a genuine attempt ' +
                    'record and you will get the real report at the end. ' +
                    'Your account is marked internal, so it stays out of the ' +
                    'results table and the question stats.'
            )
        ) {
            return
        }
        startAttempt(
            { diagnosticSetId: setId, agreedToTerms: true },
            {
                onSuccess: (state) => {
                    if (state) navigate(`/diagnostic/attempts/${state.attempt.id}`)
                },
                onError: (error: Error) =>
                    toast.error(error.message || 'Could not start the attempt.'),
            }
        )
    }

    if (isLoading) return <LoadingPage />

    if (isError || !set) {
        return (
            <AdminLayout>
                <div className="py-16 text-center">
                    <h1 className="text-2xl font-semibold">
                        Couldn't load this set
                    </h1>
                    <p className="mt-2 text-gray-500">
                        <Link className="underline" to="/admin/sets">
                            Back to diagnostic sets
                        </Link>
                    </p>
                </div>
            </AdminLayout>
        )
    }

    const questions = set.questions
    const question = questions[index]

    function responseFor(questionId: string) {
        return responses.find((r) => r.questionId === questionId)
    }

    function update(questionId: string, patch: Partial<DiagnosticResponseState>) {
        setResponses((current) => {
            const existing = current.find((r) => r.questionId === questionId)
            const next: DiagnosticResponseState = {
                questionId,
                selectedOption: null,
                isFlagged: false,
                ...existing,
                ...patch,
            } as DiagnosticResponseState
            return [
                ...current.filter((r) => r.questionId !== questionId),
                next,
            ]
        })
    }

    return (
        <AdminLayout>
            <div className="mt-6">
                {/* Said plainly, because the screen is otherwise
                    indistinguishable from the real exam — which is the point,
                    and also the risk. */}
                <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md border border-dashed bg-muted/40 p-3">
                    <Badge>Preview</Badge>
                    <span className="text-sm">
                        <strong>{set.title}</strong> — this is what a student
                        sees. Browsing here records nothing: no attempt, no
                        timer, nothing to submit. Use <em>Sit it timed</em> to
                        take it for real and see the report.
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                        <Badge variant={set.status === 'published' ? 'default' : 'secondary'}>
                            {set.status}
                        </Badge>
                        <Badge variant="outline">
                            {set.isFree ? 'Free' : 'Season Pass'}
                        </Badge>
                        <Button
                            size="sm"
                            disabled={questions.length === 0 || isStarting}
                            onClick={sitItTimed}
                        >
                            {isStarting ? 'Starting…' : 'Sit it timed'}
                        </Button>
                        <Link to="/admin/sets">
                            <Button variant="outline" size="sm">
                                Back to sets
                            </Button>
                        </Link>
                    </div>
                </div>

                {questions.length === 0 ? (
                    <p className="py-16 text-center text-muted-foreground">
                        This set has no questions yet.
                    </p>
                ) : (
                    <div className="flex gap-6">
                        <div className="w-56 shrink-0">
                            <QuestionNavigator
                                questions={questions}
                                responses={responses}
                                currentIndex={index}
                                onJump={setIndex}
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <QuestionPane
                                question={question}
                                response={responseFor(question.id)}
                                questionNumber={index + 1}
                                totalQuestions={questions.length}
                                onAnswer={(label) =>
                                    update(question.id, { selectedOption: label })
                                }
                                onToggleFlag={() =>
                                    update(question.id, {
                                        isFlagged:
                                            !responseFor(question.id)?.isFlagged,
                                    })
                                }
                            />
                            <div className="mt-4 flex justify-between">
                                <Button
                                    variant="outline"
                                    disabled={index === 0}
                                    onClick={() => setIndex((i) => i - 1)}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={index >= questions.length - 1}
                                    onClick={() => setIndex((i) => i + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
