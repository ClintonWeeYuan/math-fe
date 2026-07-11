import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { diagnosticAttemptQueryKey } from '@/lib/diagnosticAttemptQueryKey.ts'
import useSubmitAttemptMutation from './useSubmitAttemptMutation'

const mockSubmit = vi.fn()
vi.mock('@/client', () => ({
    submitAttemptDiagnosticAttemptsAttemptIdSubmitPost: (...args: unknown[]) =>
        mockSubmit(...args),
}))

const ATTEMPT_ID = 'att-1'
const KEY = diagnosticAttemptQueryKey(ATTEMPT_ID)

function makeClientAndWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    })
    const wrapper = ({ children }: PropsWithChildren) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    return { queryClient, wrapper }
}

describe('useSubmitAttemptMutation', () => {
    beforeEach(() => mockSubmit.mockReset())

    it('invalidates the attempt query on a successful submit (so the terminal state refetches)', async () => {
        mockSubmit.mockResolvedValue({
            data: { attempt: { status: 'submitted' } },
            error: undefined,
            response: { status: 200, ok: true },
        })
        const { queryClient, wrapper } = makeClientAndWrapper()
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
        const { result } = renderHook(
            () => useSubmitAttemptMutation({ attemptId: ATTEMPT_ID }),
            { wrapper }
        )

        result.current.mutate()

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: KEY })
    })

    it('still invalidates on a 409 (already timed out) — same terminal outcome, no special-casing', async () => {
        // With throwOnError=false the client resolves; the hook returns
        // data:undefined but onSettled fires regardless, which is what we
        // rely on to flip ExamPage to the closed view either way.
        mockSubmit.mockResolvedValue({
            data: undefined,
            error: { detail: "Attempt is 'timed_out' and cannot be submitted." },
            response: { status: 409, ok: false },
        })
        const { queryClient, wrapper } = makeClientAndWrapper()
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
        const { result } = renderHook(
            () => useSubmitAttemptMutation({ attemptId: ATTEMPT_ID }),
            { wrapper }
        )

        result.current.mutate()

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: KEY })
    })
})
