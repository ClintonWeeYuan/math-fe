import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import useBulkImportSpmQuestionsMutation from './useBulkImportSpmQuestionsMutation'

const mockImport = vi.fn()
vi.mock('@/client', () => ({
    bulkImportSpmQuestionsQuestionsBulkImportPost: (...args: unknown[]) =>
        mockImport(...args),
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
    questionBank: {
        title: 'SPM Chemistry — Paper 1 (Batch 5)',
        subject: 'SPM Chemistry',
        questionOrder: [],
    },
    questions: [],
} as Parameters<
    ReturnType<typeof useBulkImportSpmQuestionsMutation>['mutate']
>[0]

describe('useBulkImportSpmQuestionsMutation', () => {
    beforeEach(() => mockImport.mockReset())

    it('returns the import summary on success', async () => {
        mockImport.mockResolvedValue({
            data: { message: 'Imported: 55 created, 0 updated.' },
            error: undefined,
            response: { status: 200 },
        })
        const { result } = renderHook(
            () => useBulkImportSpmQuestionsMutation(),
            { wrapper }
        )
        act(() => result.current.mutate(body))
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toEqual({
            message: 'Imported: 55 created, 0 updated.',
        })
    })

    it('rejects (not a false success) when the client resolves an error', async () => {
        // The generated client resolves { data: undefined, error } on an HTTP
        // error rather than throwing, so returning `.data` blindly would report
        // a rejected import as a success.
        mockImport.mockResolvedValue({
            data: undefined,
            error: {
                detail: [
                    { loc: ['body', 'questions', 0], msg: 'field required' },
                ],
            },
            response: { status: 422 },
        })
        const { result } = renderHook(
            () => useBulkImportSpmQuestionsMutation(),
            { wrapper }
        )
        act(() => result.current.mutate(body))
        await waitFor(() => expect(result.current.isError).toBe(true))
        expect(result.current.error?.message).toContain('required schema')
    })

    it('surfaces a backend string detail verbatim', async () => {
        mockImport.mockResolvedValue({
            data: undefined,
            error: { detail: "Subject 'SPM Chemistry' doesn't exist." },
            response: { status: 400 },
        })
        const { result } = renderHook(
            () => useBulkImportSpmQuestionsMutation(),
            { wrapper }
        )
        act(() => result.current.mutate(body))
        await waitFor(() => expect(result.current.isError).toBe(true))
        expect(result.current.error?.message).toContain("doesn't exist")
    })
})
