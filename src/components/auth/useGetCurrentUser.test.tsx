import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { useGetCurrentUserQuery } from './useGetCurrentUser'

/**
 * These tests previously mocked the client as *rejecting* with an AxiosError,
 * and passed while the hook was broken in production.
 *
 * The generated client is fetch-based with ThrowOnError=false: it RESOLVES on
 * an HTTP error, handing back `{ data: undefined, error, response }`. It never
 * throws, so the hook's axios.isAxiosError branch could not fire — the stale
 * token was never cleared, and returning undefined made react-query reject the
 * query. With refetchOnMount off and a 24h staleTime, an expired session
 * showed a permanent "Loading…" rather than signing the student out.
 *
 * So every mock below returns the shape the real client actually returns. A
 * test that mocks a transport the app does not use can only confirm the
 * mock.
 */

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

/** What the fetch client resolves with — never a rejection. */
function resolvesWith({
    status,
    data,
    error,
}: {
    status: number
    data?: unknown
    error?: unknown
}) {
    return Promise.resolve({
        data,
        error,
        response: { status } as Response,
        request: {} as Request,
    })
}

const A_USER = {
    id: '223797f7-d29e-4914-889a-d0fff86a1436',
    name: 'Hazel Wee',
    email: 'hazel@example.com',
    userType: 'USER',
}

function render() {
    return renderHook(() => useGetCurrentUserQuery({ enabled: true }), {
        wrapper,
    })
}

describe('useGetCurrentUserQuery', () => {
    beforeEach(() => {
        localStorage.clear()
        mockGetCurrentUser.mockReset()
    })

    it('signs the student out on a 401 rather than hanging', async () => {
        // The regression that reached production: a 401 resolves, so nothing
        // was thrown, `data` was undefined, and react-query rejected the query
        // instead of the app treating it as "logged out".
        localStorage.setItem('token', 'stale-token')
        mockGetCurrentUser.mockReturnValue(
            resolvesWith({
                status: 401,
                error: { detail: 'Could not validate' },
            })
        )

        const { result } = render()

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toBeNull()
    })

    it('clears the dead token so it is not sent on every later request', async () => {
        localStorage.setItem('token', 'stale-token')
        mockGetCurrentUser.mockReturnValue(resolvesWith({ status: 401 }))

        const { result } = render()

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(localStorage.getItem('token')).toBeNull()
    })

    it('returns the user on success', async () => {
        localStorage.setItem('token', 'good-token')
        mockGetCurrentUser.mockReturnValue(
            resolvesWith({ status: 200, data: A_USER })
        )

        const { result } = render()

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toEqual(A_USER)
    })

    it('surfaces a server failure as isError instead of signing anyone out', async () => {
        localStorage.setItem('token', 'good-token')
        mockGetCurrentUser.mockReturnValue(
            resolvesWith({ status: 500, error: { detail: 'boom' } })
        )

        const { result } = render()

        await waitFor(() => expect(result.current.isError).toBe(true))
        // A 500 says nothing about the token; clearing it would log out a
        // student whose session is fine because a server hiccuped.
        expect(localStorage.getItem('token')).toBe('good-token')
    })

    it('surfaces a thrown network failure as isError too', async () => {
        // fetch itself still rejects when the request never completes.
        localStorage.setItem('token', 'good-token')
        mockGetCurrentUser.mockRejectedValue(new Error('Network down'))

        const { result } = render()

        await waitFor(() => expect(result.current.isError).toBe(true))
        expect(localStorage.getItem('token')).toBe('good-token')
    })

    it('turns an empty 200 into a stated error, not react-query complaining', async () => {
        // The queryFn must never RETURN undefined: react-query rejects that
        // internally ("Query data cannot be undefined"), which is what the
        // app rendered as a stuck loading screen. A 200 with no body is a
        // real failure and should say so.
        localStorage.setItem('token', 'good-token')
        mockGetCurrentUser.mockReturnValue(
            resolvesWith({ status: 200, data: undefined })
        )

        const { result } = render()

        await waitFor(() => expect(result.current.isError).toBe(true))
        expect(result.current.error?.message).toBe(
            'Could not load your account.'
        )
        expect(localStorage.getItem('token')).toBe('good-token')
    })

    it('returns null without calling the API when there is no token', async () => {
        const { result } = render()

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toBeNull()
        expect(mockGetCurrentUser).not.toHaveBeenCalled()
    })
})
