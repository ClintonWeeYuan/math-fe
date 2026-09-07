import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    upsertDiagnosticResponseDiagnosticAttemptsAttemptIdResponsesQuestionIdPatch,
    type DiagnosticAttemptStateResponse,
    type UpsertDiagnosticResponseBody,
} from '@/client'
import { getAuthHeaders } from '@/lib/authHeaders.ts'
import { diagnosticAttemptQueryKey } from '@/lib/diagnosticAttemptQueryKey.ts'

/** Carries the HTTP status so onError can distinguish a 409 (attempt no
 * longer in_progress — the buzzer-race case) from any other failure. */
export class AttemptWriteError extends Error {
    status: number
    constructor(status: number) {
        super(`Attempt write failed with status ${status}`)
        this.status = status
    }
}

type Variables = {
    questionId: string
    body: UpsertDiagnosticResponseBody
}

type ResponseState = DiagnosticAttemptStateResponse['responses'][number]

type Context = {
    previous: DiagnosticAttemptStateResponse | undefined
    /** Exactly the fields this mutation wrote optimistically, so onError can
     * check whether the cache still shows its own write before undoing it. */
    patch: Partial<ResponseState>
}

/**
 * Optimistic answer/flag write, following the exact recipe already in the
 * codebase (useUpdateQuestionStatusMutation): onMutate cancels + snapshots
 * + patches the single shared attempt-state entry so the click (answer
 * select, flag toggle) and the navigator re-color feel instant; onError
 * undoes it.
 *
 * That undo is deliberately narrow, because the obvious version of it is
 * wrong. Restoring the whole snapshot on any failure means a write that
 * fails slowly erases whatever landed while it was in flight: pick D, pick
 * E a moment later, D's request then times out, and D's rollback restores
 * the state from before either click — wiping E from the screen even
 * though the server accepted and stored it. The student sees a blank
 * question, clicks again, and the UI and the database have already
 * disagreed. So instead of blanket-restoring, we undo only this question's
 * entry, and only while the cache still holds this mutation's own write.
 * If something newer is showing, that newer value is the truth on screen
 * and this stale failure leaves it alone.
 *
 * The 409 case is handled deliberately, not as a raw error: if the attempt
 * timed out between render and click, the write 409s — we undo (it didn't
 * land) and invalidate the attempt query, so the refetch returns
 * status='timed_out' and ExamPage's status switch flips to the terminal
 * view. Same mechanism PR 2's timer will reach; there's no error toast for
 * this — running out of time is an expected outcome, not a failure.
 */
export default function useUpsertResponseMutation({ attemptId }: { attemptId: string }) {
    const queryClient = useQueryClient()
    const queryKey = diagnosticAttemptQueryKey(attemptId)

    return useMutation<
        DiagnosticAttemptStateResponse['responses'][number] | undefined,
        AttemptWriteError,
        Variables,
        Context
    >({
        mutationFn: async ({ questionId, body }) => {
            const result =
                await upsertDiagnosticResponseDiagnosticAttemptsAttemptIdResponsesQuestionIdPatch(
                    {
                        path: { attempt_id: attemptId, question_id: questionId },
                        body,
                        headers: getAuthHeaders(),
                    }
                )
            if (result.error !== undefined) {
                // A request that never reached the server (offline, DNS,
                // aborted) has an error but no response, and so no status.
                // 0 stands for that: it is not 409, which is the only status
                // onError treats specially, so a transport failure takes the
                // ordinary undo path rather than being mistaken for a
                // timed-out attempt.
                throw new AttemptWriteError(result.response?.status ?? 0)
            }
            return result.data
        },
        onMutate: async ({ questionId, body }): Promise<Context> => {
            await queryClient.cancelQueries({ queryKey })
            const previous =
                queryClient.getQueryData<DiagnosticAttemptStateResponse>(queryKey)

            // Normalize the body into the state's shape once. The body
            // permits isFlagged:null (the PATCH contract), but a stored
            // response's isFlagged is a plain boolean — only apply fields
            // that were actually sent, coercing a null flag to false.
            const patch: Partial<ResponseState> = {}
            if (body.selectedOption !== undefined) {
                patch.selectedOption = body.selectedOption
            }
            if (body.isFlagged !== undefined && body.isFlagged !== null) {
                patch.isFlagged = body.isFlagged
            }

            queryClient.setQueryData<DiagnosticAttemptStateResponse>(queryKey, (prev) => {
                if (prev === undefined) return prev
                const existing = prev.responses.find((r) => r.questionId === questionId)
                if (existing) {
                    return {
                        ...prev,
                        responses: prev.responses.map((r) =>
                            r.questionId === questionId ? { ...r, ...patch } : r
                        ),
                    }
                }
                // First touch of this question — append a new response-state
                // entry. questionOrderIndex is derived from the set's own
                // question order (the questions array), matching what the
                // server computes, so the optimistic row is consistent even
                // before the refetch.
                const orderIndex = prev.questions.findIndex((q) => q.id === questionId)
                return {
                    ...prev,
                    responses: [
                        ...prev.responses,
                        {
                            questionId,
                            questionOrderIndex: orderIndex,
                            selectedOption: patch.selectedOption ?? null,
                            isFlagged: patch.isFlagged ?? false,
                            viewCount: 0,
                        },
                    ],
                }
            })

            return { previous, patch }
        },
        onError: (error, { questionId }, context) => {
            // Undo this question's optimistic entry — but only while the
            // cache still shows what THIS mutation wrote. A newer click on
            // the same question supersedes this one, and a stale failure
            // must not drag the screen back behind it (see the note above
            // the hook). Other questions' entries are never touched, so a
            // failure here can't disturb answers given elsewhere.
            if (context !== undefined) {
                const current =
                    queryClient.getQueryData<DiagnosticAttemptStateResponse>(queryKey)
                const showing = current?.responses.find((r) => r.questionId === questionId)
                const stillOurs =
                    showing !== undefined &&
                    (Object.keys(context.patch) as (keyof ResponseState)[]).every(
                        (field) => showing[field] === context.patch[field]
                    )
                if (current !== undefined && stillOurs) {
                    const restored = context.previous?.responses.find(
                        (r) => r.questionId === questionId
                    )
                    queryClient.setQueryData<DiagnosticAttemptStateResponse>(queryKey, {
                        ...current,
                        responses: restored
                            ? // The question already had a stored answer or flag
                              // before this write — put that back verbatim.
                              current.responses.map((r) =>
                                  r.questionId === questionId ? restored : r
                              )
                            : // First touch of this question, so onMutate
                              // appended the row; drop it again.
                              current.responses.filter(
                                  (r) => r.questionId !== questionId
                              ),
                    })
                }
            }
            // A 409 means the attempt is no longer in_progress (timed out
            // mid-click) — refetch so the terminal state renders via
            // ExamPage's status switch, rather than surfacing an error.
            if (error.status === 409) {
                queryClient.invalidateQueries({ queryKey })
            }
        },
    })
}
