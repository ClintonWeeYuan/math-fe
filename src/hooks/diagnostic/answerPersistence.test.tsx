import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import type { DiagnosticAttemptStateResponse } from '@/client'
import useGetAttemptStateQuery from './useGetAttemptStateQuery'
import useUpsertResponseMutation from './useUpsertResponseMutation'

/**
 * A selected answer must never disappear off the screen on its own.
 *
 * Both cases here are regressions from real behaviour observed in
 * production on 21 Aug 2026: one attempt recorded fifteen answer_change
 * events on a single question, clicks 0.2-0.6s apart, where every other
 * question on the platform recorded one or two. ExamPage no-ops a click on
 * the option already showing, so fifteen events mean the screen kept
 * showing something other than what had just been chosen. These are the
 * two ways it could do that.
 */

const mockUpsert = vi.fn()
const mockGetState = vi.fn()
vi.mock('@/client', () => ({
    upsertDiagnosticResponseDiagnosticAttemptsAttemptIdResponsesQuestionIdPatch: (
        ...args: unknown[]
    ) => mockUpsert(...args),
    getAttemptStateDiagnosticAttemptsAttemptIdGet: (...args: unknown[]) =>
        mockGetState(...args),
}))
vi.mock('@/lib/authHeaders.ts', () => ({ getAuthHeaders: () => ({}) }))

const ATTEMPT_ID = 'att-1'

/** What GET /diagnostic-attempts/{id} reports: no answer stored yet. */
function serverState(): DiagnosticAttemptStateResponse {
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
            {
                id: 'qa',
                stem: 'qa',
                options: [
                    { label: 'A', text: 'a' },
                    { label: 'D', text: 'd' },
                    { label: 'E', text: 'e' },
                ],
            },
        ],
        responses: [],
    }
}

function accepted(selectedOption: string) {
    return {
        data: {
            questionId: 'qa',
            questionOrderIndex: 0,
            selectedOption,
            isFlagged: false,
            viewCount: 0,
        },
        error: undefined,
    }
}

function setup(queryClient: QueryClient) {
    const wrapper = ({ children }: PropsWithChildren) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    return renderHook(
        () => ({
            state: useGetAttemptStateQuery({ attemptId: ATTEMPT_ID }),
            upsert: useUpsertResponseMutation({ attemptId: ATTEMPT_ID }),
        }),
        { wrapper }
    )
}

type Rendered = ReturnType<typeof setup>['result']
const showing = (result: Rendered) =>
    result.current.state.data!.responses.find((r) => r.questionId === 'qa')
        ?.selectedOption ?? null

describe('a chosen answer stays on screen', () => {
    beforeEach(() => {
        mockUpsert.mockReset()
        mockGetState.mockReset()
        mockGetState.mockImplementation(async () => ({ data: serverState() }))
        focusManager.setFocused(true)
    })

    it('survives a window refocus while the write is still in flight', async () => {
        // The bare client main.tsx builds: library defaults, which include
        // refetchOnWindowFocus. useGetAttemptStateQuery opts out itself, so
        // the opt-out is what this exercises.
        const queryClient = new QueryClient()

        let landWrite: () => void = () => {}
        mockUpsert.mockImplementation(
            () =>
                new Promise((resolve) => {
                    landWrite = () => resolve(accepted('E'))
                })
        )

        const { result } = setup(queryClient)
        await waitFor(() => expect(result.current.state.data).toBeDefined())

        act(() => {
            result.current.upsert.mutate({
                questionId: 'qa',
                body: { selectedOption: 'E' },
            })
        })
        await waitFor(() => expect(showing(result)).toBe('E'))

        // Student glances at another window and comes back. The PATCH has
        // not landed, so a refetch here would report no answer at all.
        await act(async () => {
            focusManager.setFocused(false)
            focusManager.setFocused(true)
            await new Promise((r) => setTimeout(r, 0))
        })
        await waitFor(() => expect(result.current.state.isFetching).toBe(false))

        expect(showing(result)).toBe('E')
        landWrite()
    })

    it('is not erased by an earlier write failing after a later one succeeded', async () => {
        const queryClient = new QueryClient({
            defaultOptions: { mutations: { retry: false } },
        })

        let failFirstWrite: () => void = () => {}
        mockUpsert
            // Pick D — hangs on a slow connection, and eventually fails.
            .mockImplementationOnce(
                () =>
                    new Promise((_resolve, reject) => {
                        failFirstWrite = () => reject(new Error('network'))
                    })
            )
            // Change to E a moment later — the server takes this one.
            .mockImplementationOnce(async () => accepted('E'))

        const { result } = setup(queryClient)
        await waitFor(() => expect(result.current.state.data).toBeDefined())

        act(() => {
            result.current.upsert.mutate({
                questionId: 'qa',
                body: { selectedOption: 'D' },
            })
        })
        await waitFor(() => expect(showing(result)).toBe('D'))

        act(() => {
            result.current.upsert.mutate({
                questionId: 'qa',
                body: { selectedOption: 'E' },
            })
        })
        await waitFor(() => expect(showing(result)).toBe('E'))

        await act(async () => {
            failFirstWrite()
            await new Promise((r) => setTimeout(r, 10))
        })

        // E is what the server stored, so E is what the student must see.
        expect(showing(result)).toBe('E')
    })

    it('still clears the answer when the only write for that question fails', async () => {
        const queryClient = new QueryClient({
            defaultOptions: { mutations: { retry: false } },
        })
        let failWrite: () => void = () => {}
        mockUpsert.mockImplementation(
            () =>
                new Promise((_resolve, reject) => {
                    failWrite = () => reject(new Error('network'))
                })
        )

        const { result } = setup(queryClient)
        await waitFor(() => expect(result.current.state.data).toBeDefined())

        act(() => {
            result.current.upsert.mutate({
                questionId: 'qa',
                body: { selectedOption: 'D' },
            })
        })
        await waitFor(() => expect(showing(result)).toBe('D'))

        await act(async () => {
            failWrite()
            await new Promise((r) => setTimeout(r, 10))
        })
        expect(showing(result)).toBe(null)

        // The appended optimistic row goes with it, rather than lingering
        // as an answered-looking entry with a null option.
        expect(result.current.state.data!.responses).toHaveLength(0)
    })
})
