import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import useCreateDiagnosticSetMutation from './useCreateDiagnosticSetMutation'

const mockCreate = vi.fn()
vi.mock('@/client', () => ({
    createDiagnosticSetDiagnosticSetsPost: (...args: unknown[]) => mockCreate(...args),
}))
vi.mock('@/lib/authHeaders.ts', () => ({ getAuthHeaders: () => ({ Authorization: 'Bearer x' }) }))

function wrapper({ children }: { children: ReactNode }) {
    const client = new QueryClient({
        defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    })
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

const body = { title: 'X', timeLimitMinutes: 40, questionIds: ['q1'] }

describe('useCreateDiagnosticSetMutation', () => {
    beforeEach(() => mockCreate.mockReset())

    it('returns the created set on success', async () => {
        mockCreate.mockResolvedValue({
            data: { id: 'set-1', status: 'draft' },
            error: undefined,
            response: { status: 201 },
        })
        const { result } = renderHook(() => useCreateDiagnosticSetMutation(), { wrapper })
        act(() => result.current.mutate(body))
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toEqual({ id: 'set-1', status: 'draft' })
    })

    it('rejects with the backend detail on a validation error (not a false success)', async () => {
        mockCreate.mockResolvedValue({
            data: undefined,
            error: { detail: "These question ids don't exist: q1." },
            response: { status: 400 },
        })
        const { result } = renderHook(() => useCreateDiagnosticSetMutation(), { wrapper })
        act(() => result.current.mutate(body))
        await waitFor(() => expect(result.current.isError).toBe(true))
        // The message carries the backend's own detail, verbatim.
        expect(result.current.error?.message).toContain("don't exist")
    })
})
