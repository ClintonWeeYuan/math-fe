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

type Context = {
    previous: DiagnosticAttemptStateResponse | undefined
}

/**
 * Optimistic answer/flag write, following the exact recipe already in the
 * codebase (useUpdateQuestionStatusMutation): onMutate cancels + snapshots
 * + patches the single shared attempt-state entry so the click (answer
 * select, flag toggle) and the navigator re-color feel instant; onError
 * rolls back.
 *
 * The 409 case is handled deliberately, not as a raw error: if the attempt
 * timed out between render and click, the write 409s — we roll back (it
 * didn't land) and invalidate the attempt query, so the refetch returns
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
                throw new AttemptWriteError(result.response.status)
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
            const patch: Partial<DiagnosticAttemptStateResponse['responses'][number]> = {}
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

            return { previous }
        },
        onError: (error, _variables, context) => {
            // Roll back the optimistic patch first, unconditionally.
            if (context?.previous !== undefined) {
                queryClient.setQueryData(queryKey, context.previous)
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
