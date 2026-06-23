import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AxiosError, AxiosHeaders } from 'axios'
import type { PropsWithChildren } from 'react'
import { useGetCurrentUserQuery } from './useGetCurrentUser'

const mockGetCurrentUser = vi.fn()

vi.mock('@/client', () => ({
    getCurrentUserUsersCurrentGet: (...args: unknown[]) =>
        mockGetCurrentUser(...args),
}))

function wrapper({ children }: PropsWithChildren) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

function unauthorizedError() {
    return new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', undefined, undefined, {
        data: { detail: 'Could not validate credentials' },
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: { headers: new AxiosHeaders() },
    })
}

describe('useGetCurrentUserQuery', () => {
    beforeEach(() => {
        localStorage.clear()
        mockGetCurrentUser.mockReset()
    })

    it('clears the stale token and resolves to null on a 401 (regression: previously left a dead token in localStorage forever)', async () => {
        localStorage.setItem('token', 'stale-token')
        mockGetCurrentUser.mockRejectedValue(unauthorizedError())

        const { result } = renderHook(
            () => useGetCurrentUserQuery({ enabled: true }),
            { wrapper }
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toBeNull()
        expect(localStorage.getItem('token')).toBeNull()
    })

    it('surfaces a non-401 failure as isError instead of silently returning null', async () => {
        localStorage.setItem('token', 'some-token')
        mockGetCurrentUser.mockRejectedValue(new Error('Network down'))

        const { result } = renderHook(
            () => useGetCurrentUserQuery({ enabled: true }),
            { wrapper }
        )

        await waitFor(() => expect(result.current.isError).toBe(true))

        // Token should NOT be cleared on an infra error - it might still be valid.
        expect(localStorage.getItem('token')).toBe('some-token')
    })

    it('returns null without calling the API when there is no token', async () => {
        const { result } = renderHook(
            () => useGetCurrentUserQuery({ enabled: true }),
            { wrapper }
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toBeNull()
        expect(mockGetCurrentUser).not.toHaveBeenCalled()
    })
})
