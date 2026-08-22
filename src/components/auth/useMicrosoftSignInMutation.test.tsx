import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { useMicrosoftSignInMutation } from './useMicrosoftSignInMutation'

const mockPost = vi.fn()

vi.mock('@/client/client.gen.ts', () => ({
    client: { post: (...args: unknown[]) => mockPost(...args) },
}))

vi.mock('@/lib/signupAttribution.ts', () => ({
    signupAttribution: () => ({ acquisition: { landingPath: '/guides/x' } }),
}))

function wrapper({ children }: PropsWithChildren) {
    const queryClient = new QueryClient({
        defaultOptions: { mutations: { retry: false } },
    })
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

function renderMutation() {
    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(
        () => useMicrosoftSignInMutation({ onSuccess, onError }),
        { wrapper }
    )
    return { result, onSuccess, onError }
}

const RESPONSE = {
    token: 'our-own-jwt',
    user: { id: '1', email: 'student@school.edu.my', name: 'A Student' },
}

describe('useMicrosoftSignInMutation', () => {
    beforeEach(() => {
        mockPost.mockReset()
    })

    it('signs the user in when the backend accepts the Microsoft token', async () => {
        mockPost.mockResolvedValue({ data: RESPONSE, error: undefined })
        const { result, onSuccess } = renderMutation()

        result.current.mutate({ credential: 'ms-id-token', nonce: 'n-1' })

        await waitFor(() => expect(onSuccess).toHaveBeenCalled())
        // First argument only: react-query also passes the variables and
        // context, which this callback does not care about.
        expect(onSuccess.mock.calls[0][0]).toEqual(RESPONSE)
        expect(mockPost).toHaveBeenCalledWith(
            expect.objectContaining({ url: '/users/microsoft' })
        )
    })

    it('sends the nonce, so the backend can bind the token to this sign-in', async () => {
        mockPost.mockResolvedValue({ data: RESPONSE, error: undefined })
        const { result } = renderMutation()

        result.current.mutate({ credential: 'ms-id-token', nonce: 'n-42' })

        await waitFor(() => expect(mockPost).toHaveBeenCalled())
        expect(mockPost.mock.calls[0][0].body).toMatchObject({
            credential: 'ms-id-token',
            nonce: 'n-42',
        })
    })

    it('sends attribution, so an account this creates records where it came from', async () => {
        mockPost.mockResolvedValue({ data: RESPONSE, error: undefined })
        const { result } = renderMutation()

        result.current.mutate({ credential: 'x' })

        await waitFor(() => expect(mockPost).toHaveBeenCalled())
        expect(mockPost.mock.calls[0][0].body.acquisition).toEqual({
            landingPath: '/guides/x',
        })
    })

    it('surfaces the backend reason rather than a generic failure', async () => {
        // The refusal students will actually hit: a school whose tenant has
        // not added the claim that proves the address. It tells them what to
        // do instead, so replacing it with our own wording would strand them.
        mockPost.mockResolvedValue({
            data: undefined,
            error: {
                detail:
                    "We can't confirm that Microsoft address belongs to your " +
                    'school, so we can\'t sign you in with it. Use the email ' +
                    'code option instead — it goes to the same address.',
            },
        })
        const { result, onError } = renderMutation()

        result.current.mutate({ credential: 'x' })

        await waitFor(() => expect(onError).toHaveBeenCalled())
        expect(onError.mock.calls[0][0].message).toContain('email code')
    })

    it('treats a resolved-but-empty response as a failure, not a sign-in', async () => {
        // The generated client resolves rather than throwing on an HTTP error,
        // so without this check a refusal looks like success with no user.
        mockPost.mockResolvedValue({ data: undefined, error: undefined })
        const { result, onError, onSuccess } = renderMutation()

        result.current.mutate({ credential: 'x' })

        await waitFor(() => expect(onError).toHaveBeenCalled())
        expect(onSuccess).not.toHaveBeenCalled()
    })

    it('falls back to its own wording when the error carries no detail', async () => {
        mockPost.mockResolvedValue({ data: undefined, error: { status: 500 } })
        const { result, onError } = renderMutation()

        result.current.mutate({ credential: 'x' })

        await waitFor(() => expect(onError).toHaveBeenCalled())
        expect(onError.mock.calls[0][0].message).toContain('Microsoft')
    })
})
