import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import useExportDiagnosticSetMutation from './useExportDiagnosticSetMutation'

const mockExport = vi.fn()
const mockDownload = vi.fn()
vi.mock('@/client', () => ({
    exportDiagnosticSetDiagnosticSetsSetIdExportGet: (...a: unknown[]) => mockExport(...a),
}))
vi.mock('@/lib/authHeaders.ts', () => ({ getAuthHeaders: () => ({ Authorization: 'Bearer x' }) }))
vi.mock('@/lib/downloadJson.ts', () => ({
    downloadJson: (...a: unknown[]) => mockDownload(...a),
}))

function wrapper({ children }: { children: ReactNode }) {
    const client = new QueryClient({
        defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    })
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useExportDiagnosticSetMutation', () => {
    beforeEach(() => {
        mockExport.mockReset()
        mockDownload.mockReset()
    })

    it('downloads the payload under the name the server chose, without it', async () => {
        mockExport.mockResolvedValue({
            data: {
                filename: 'esat-biology-set-b.json',
                diagnosticSet: { title: 'Set B' },
                questions: [{ sourceRef: 'q1' }],
            },
            error: undefined,
        })
        const { result } = renderHook(() => useExportDiagnosticSetMutation(), { wrapper })
        act(() => result.current.mutate('set-1'))
        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        const [name, body] = mockDownload.mock.calls[0]
        expect(name).toBe('esat-biology-set-b.json')
        // filename is transport, not part of the import format — a file
        // containing it would not match what bulk import accepts.
        expect(body).toEqual({
            diagnosticSet: { title: 'Set B' },
            questions: [{ sourceRef: 'q1' }],
        })
    })

    it('does not download a file when the request failed', async () => {
        // The generated client resolves { data: undefined, error } rather than
        // throwing, so returning `.data` would save a file saying "undefined".
        mockExport.mockResolvedValue({ data: undefined, error: { detail: 'nope' } })
        const { result } = renderHook(() => useExportDiagnosticSetMutation(), { wrapper })
        act(() => result.current.mutate('set-1'))
        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(mockDownload).not.toHaveBeenCalled()
    })
})
