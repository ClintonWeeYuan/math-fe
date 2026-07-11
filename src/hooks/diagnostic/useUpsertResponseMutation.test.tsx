import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import type { DiagnosticAttemptStateResponse } from '@/client'
import { diagnosticAttemptQueryKey } from '@/lib/diagnosticAttemptQueryKey.ts'
import useUpsertResponseMutation from './useUpsertResponseMutation'

const mockUpsert = vi.fn()
vi.mock('@/client', () => ({
    upsertDiagnosticResponseDiagnosticAttemptsAttemptIdResponsesQuestionIdPatch: (
        ...args: unknown[]
    ) => mockUpsert(...args),
}))

const ATTEMPT_ID = 'att-1'
const KEY = diagnosticAttemptQueryKey(ATTEMPT_ID)

function seedState(): DiagnosticAttemptStateResponse {
    return {
        attempt: {
            id: ATTEMPT_ID,
            diagnosticSetId: 'set-1',
            status: 'in_progress',
            startedAt: '2026-07-11T00:00:00Z',
            serverDeadlineAt: '2026-07-11T01:00:00Z',
            submittedAt: null,
            agreedToTerms: true,
            totalScore: null,
        },
        questions: [
            { id: 'qa', stem: 'qa', options: [{ label: 'A', text: 'a' }] },
            { id: 'qb', stem: 'qb', options: [{ label: 'A', text: 'a' }] },
        ],
        responses: [],
    }
}

function makeClientAndWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    queryClient.setQueryData(KEY, seedState())
    const wrapper = ({ children }: PropsWithChildren) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    return { queryClient, wrapper }
}

function cachedResponses(queryClient: QueryClient) {
    return queryClient.getQueryData<DiagnosticAttemptStateResponse>(KEY)!.responses
}

describe('useUpsertResponseMutation', () => {
    beforeEach(() => mockUpsert.mockReset())

    it('optimistically appends a new response before the server confirms', async () => {
        mockUpsert.mockResolvedValue({
            data: { questionId: 'qa', questionOrderIndex: 0, selectedOption: 'A', isFlagged: false, viewCount: 0 },
            error: undefined,
            response: { status: 200, ok: true },
        })
        const { queryClient, wrapper } = makeClientAndWrapper()
        const { result } = renderHook(() => useUpsertResponseMutation({ attemptId: ATTEMPT_ID }), { wrapper })

        result.current.mutate({ questionId: 'qa', body: { selectedOption: 'A' } })

        // Optimistic patch is synchronous within onMutate — the cache shows
        // the answer immediately, keyed by questionOrderIndex derived from
        // the questions array (qa is index 0).
        await waitFor(() => {
            const r = cachedResponses(queryClient).find((x) => x.questionId === 'qa')
            expect(r?.selectedOption).toBe('A')
            expect(r?.questionOrderIndex).toBe(0)
        })
    })

    it('rolls back to the previous responses on a non-409 failure', async () => {
        mockUpsert.mockResolvedValue({
            data: undefined,
            error: { detail: 'boom' },
            response: { status: 500, ok: false },
        })
        const { queryClient, wrapper } = makeClientAndWrapper()
        const { result } = renderHook(() => useUpsertResponseMutation({ attemptId: ATTEMPT_ID }), { wrapper })

        result.current.mutate({ questionId: 'qa', body: { selectedOption: 'A' } })

        await waitFor(() => expect(result.current.isError).toBe(true))
        // The optimistic append was rolled back — responses is empty again.
        expect(cachedResponses(queryClient)).toHaveLength(0)
    })

    it('on a 409 (timed out mid-click) rolls back and invalidates so the terminal state refetches', async () => {
        mockUpsert.mockResolvedValue({
            data: undefined,
            error: { detail: "Attempt is 'timed_out' and cannot be submitted." },
            response: { status: 409, ok: false },
        })
        const { queryClient, wrapper } = makeClientAndWrapper()
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
        const { result } = renderHook(() => useUpsertResponseMutation({ attemptId: ATTEMPT_ID }), { wrapper })

        result.current.mutate({ questionId: 'qa', body: { selectedOption: 'A' } })

        await waitFor(() => expect(result.current.isError).toBe(true))
        // Rolled back...
        expect(cachedResponses(queryClient)).toHaveLength(0)
        // ...and the attempt query was invalidated, so ExamPage's status
        // switch will flip to the terminal view on refetch.
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: KEY })
    })
})
