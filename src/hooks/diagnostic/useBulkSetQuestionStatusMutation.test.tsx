import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import useBulkSetQuestionStatusMutation from './useBulkSetQuestionStatusMutation'

const mockBulk = vi.fn()
vi.mock('@/client', () => ({
    bulkSetQuestionStatusDiagnosticQuestionsBulkStatusPost: (...args: unknown[]) =>
        mockBulk(...args),
}))
vi.mock('@/lib/authHeaders.ts', () => ({ getAuthHeaders: () => ({ Authorization: 'Bearer x' }) }))

function wrapper({ children }: { children: ReactNode }) {
    const client = new QueryClient({
        defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    })
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

const body = { questionIds: ['q1', 'q2'], status: 'published' as const }

describe('useBulkSetQuestionStatusMutation', () => {
    beforeEach(() => mockBulk.mockReset())

    it('returns the updated count on success', async () => {
        mockBulk.mockResolvedValue({
            data: { updatedCount: 2 },
            error: undefined,
            response: { status: 200 },
        })
        const { result } = renderHook(() => useBulkSetQuestionStatusMutation(), { wrapper })
        act(() => result.current.mutate(body))
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toEqual({ updatedCount: 2 })
    })

    it('rejects on an HTTP error instead of a false success', async () => {
        mockBulk.mockResolvedValue({
            data: undefined,
            error: { detail: 'nope' },
            response: { status: 403 },
        })
        const { result } = renderHook(() => useBulkSetQuestionStatusMutation(), { wrapper })
        act(() => result.current.mutate(body))
        await waitFor(() => expect(result.current.isError).toBe(true))
        expect(result.current.isSuccess).toBe(false)
    })
})
