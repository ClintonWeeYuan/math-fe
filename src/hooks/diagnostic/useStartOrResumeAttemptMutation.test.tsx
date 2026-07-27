import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import useStartOrResumeAttemptMutation from './useStartOrResumeAttemptMutation'

const mockStart = vi.fn()
vi.mock('@/client', () => ({
    startOrResumeAttemptDiagnosticAttemptsPost: (...a: unknown[]) => mockStart(...a),
}))
vi.mock('@/lib/authHeaders.ts', () => ({
    getAuthHeaders: () => ({ Authorization: 'Bearer x' }),
}))

function wrapper({ children }: { children: ReactNode }) {
    const client = new QueryClient({
        defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    })
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

const body = { diagnosticSetId: 'set-1', agreedToTerms: true }

describe('useStartOrResumeAttemptMutation', () => {
    beforeEach(() => mockStart.mockReset())

    it('returns the attempt state on success', async () => {
        mockStart.mockResolvedValue({
            data: { attempt: { id: 'a1' } },
            error: undefined,
            response: { status: 200 },
        })
        const { result } = renderHook(() => useStartOrResumeAttemptMutation(), { wrapper })
        act(() => result.current.mutate(body))
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toEqual({ attempt: { id: 'a1' } })
    })

    it('rejects with status 402 for a premium set so the caller can upsell', async () => {
        mockStart.mockResolvedValue({
            data: undefined,
            error: { upsell: 'season_pass_2026' },
            response: { status: 402 },
        })
        const { result } = renderHook(() => useStartOrResumeAttemptMutation(), { wrapper })
        act(() => result.current.mutate(body))
        await waitFor(() => expect(result.current.isError).toBe(true))
        // Without this the start button was a silent no-op.
        expect(result.current.error?.status).toBe(402)
    })
})
