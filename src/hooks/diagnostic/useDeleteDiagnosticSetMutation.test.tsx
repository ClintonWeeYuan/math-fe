import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import useDeleteDiagnosticSetMutation from './useDeleteDiagnosticSetMutation'

const mockDelete = vi.fn()
vi.mock('@/client', () => ({
    deleteDiagnosticSetDiagnosticSetsSetIdDelete: (...args: unknown[]) => mockDelete(...args),
}))
vi.mock('@/lib/authHeaders.ts', () => ({ getAuthHeaders: () => ({ Authorization: 'Bearer x' }) }))

function wrapper({ children }: { children: ReactNode }) {
    const client = new QueryClient({
        defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    })
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useDeleteDiagnosticSetMutation', () => {
    beforeEach(() => mockDelete.mockReset())

    it('resolves on success', async () => {
        mockDelete.mockResolvedValue({
            data: { isSuccess: true },
            error: undefined,
            response: { status: 200 },
        })
        const { result } = renderHook(() => useDeleteDiagnosticSetMutation(), { wrapper })
        act(() => result.current.mutate('set-1'))
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })

    it('rejects with the backend detail on the attempts 409 (not a false success)', async () => {
        mockDelete.mockResolvedValue({
            data: undefined,
            error: { detail: 'Can’t delete: students have taken this set. Unpublish it instead.' },
            response: { status: 409 },
        })
        const { result } = renderHook(() => useDeleteDiagnosticSetMutation(), { wrapper })
        act(() => result.current.mutate('set-1'))
        await waitFor(() => expect(result.current.isError).toBe(true))
        expect(result.current.isSuccess).toBe(false)
        expect(result.current.error?.message).toContain('Unpublish it instead')
    })
})
