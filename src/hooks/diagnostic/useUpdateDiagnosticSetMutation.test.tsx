import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import useUpdateDiagnosticSetMutation from './useUpdateDiagnosticSetMutation'

const mockPatch = vi.fn()
vi.mock('@/client', () => ({
    updateDiagnosticSetDiagnosticSetsSetIdPatch: (...args: unknown[]) => mockPatch(...args),
}))
vi.mock('@/lib/authHeaders.ts', () => ({ getAuthHeaders: () => ({ Authorization: 'Bearer x' }) }))

function wrapper({ children }: { children: ReactNode }) {
    const client = new QueryClient({
        defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    })
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useUpdateDiagnosticSetMutation', () => {
    beforeEach(() => mockPatch.mockReset())

    it('resolves with the updated set on success', async () => {
        mockPatch.mockResolvedValue({
            data: { id: 'set-1', status: 'published' },
            error: undefined,
            response: { status: 200 },
        })
        const { result } = renderHook(() => useUpdateDiagnosticSetMutation({ setId: 'set-1' }), {
            wrapper,
        })
        act(() => result.current.mutate({ status: 'published' }))
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toEqual({ id: 'set-1', status: 'published' })
    })

    it('rejects when the request fails, rather than reporting a false success', async () => {
        // The generated client resolves with { data: undefined, error } on an
        // HTTP error. If this hook returned .data blindly, react-query would
        // call this a success and the UI would toast "Set published" while
        // nothing changed — the exact failure live testing surfaced (401 from
        // an expired token).
        mockPatch.mockResolvedValue({
            data: undefined,
            error: { detail: 'Could not validate credentials' },
            response: { status: 401 },
        })
        const { result } = renderHook(() => useUpdateDiagnosticSetMutation({ setId: 'set-1' }), {
            wrapper,
        })
        act(() => result.current.mutate({ status: 'published' }))

        await waitFor(() => expect(result.current.isError).toBe(true))
        expect(result.current.isSuccess).toBe(false)
        expect((result.current.error as { status?: number }).status).toBe(401)
    })
})
