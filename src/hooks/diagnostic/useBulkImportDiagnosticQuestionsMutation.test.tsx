import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import useBulkImportDiagnosticQuestionsMutation from './useBulkImportDiagnosticQuestionsMutation'

const mockImport = vi.fn()
vi.mock('@/client', () => ({
    bulkImportDiagnosticQuestionsDiagnosticQuestionsBulkImportPost: (
        ...args: unknown[]
    ) => mockImport(...args),
}))
vi.mock('@/lib/authHeaders.ts', () => ({
    getAuthHeaders: () => ({ Authorization: 'Bearer x' }),
}))

function wrapper({ children }: { children: ReactNode }) {
    const client = new QueryClient({
        defaultOptions: {
            mutations: { retry: false },
            queries: { retry: false },
        },
    })
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

const body = {
    diagnosticSet: { title: 'X', timeLimitMinutes: 40, questionOrder: [] },
    questions: [],
} as Parameters<
    ReturnType<typeof useBulkImportDiagnosticQuestionsMutation>['mutate']
>[0]

describe('useBulkImportDiagnosticQuestionsMutation', () => {
    beforeEach(() => mockImport.mockReset())

    it('returns the import summary on success', async () => {
        mockImport.mockResolvedValue({
            data: { message: 'Imported 27 questions.' },
            error: undefined,
            response: { status: 200 },
        })
        const { result } = renderHook(
            () => useBulkImportDiagnosticQuestionsMutation(),
            { wrapper }
        )
        act(() => result.current.mutate(body))
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toEqual({ message: 'Imported 27 questions.' })
    })

    it('rejects (not a false success) when the client resolves an error', async () => {
        // A pydantic 422: detail is a list, so the fallback message is used.
        mockImport.mockResolvedValue({
            data: undefined,
            error: { detail: [{ loc: ['body', 'questions', 0], msg: 'field required' }] },
            response: { status: 422 },
        })
        const { result } = renderHook(
            () => useBulkImportDiagnosticQuestionsMutation(),
            { wrapper }
        )
        act(() => result.current.mutate(body))
        await waitFor(() => expect(result.current.isError).toBe(true))
        expect(result.current.error?.message).toContain('required schema')
    })

    it('surfaces a backend string detail verbatim', async () => {
        mockImport.mockResolvedValue({
            data: undefined,
            error: { detail: 'Duplicate sourceRef: q1.' },
            response: { status: 400 },
        })
        const { result } = renderHook(
            () => useBulkImportDiagnosticQuestionsMutation(),
            { wrapper }
        )
        act(() => result.current.mutate(body))
        await waitFor(() => expect(result.current.isError).toBe(true))
        expect(result.current.error?.message).toContain('Duplicate sourceRef')
    })
})
