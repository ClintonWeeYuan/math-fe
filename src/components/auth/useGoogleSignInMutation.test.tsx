import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { useGoogleSignInMutation } from './useGoogleSignInMutation'

const mockSignIn = vi.fn()

vi.mock('@/client', () => ({
    signInWithGoogleUsersGooglePost: (...args: unknown[]) =>
        mockSignIn(...args),
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
        () => useGoogleSignInMutation({ onSuccess, onError }),
        { wrapper }
    )
    return { result, onSuccess, onError }
}

describe('useGoogleSignInMutation', () => {
    beforeEach(() => {
        mockSignIn.mockReset()
    })

    it('signs the user in when the backend accepts the Google token', async () => {
        const response = {
            token: 'our-own-jwt',
            user: { id: '1', email: 'student@example.com', name: 'A Student' },
        }
        mockSignIn.mockResolvedValue({ data: response, error: undefined })

        const { result, onSuccess } = renderMutation()
        result.current.mutate('google-id-token')

        await waitFor(() => expect(onSuccess).toHaveBeenCalled())
        expect(onSuccess.mock.calls[0][0]).toEqual(response)
        expect(mockSignIn).toHaveBeenCalledWith({
            body: { credential: 'google-id-token' },
        })
    })

    it('treats a refused sign-in as a failure', async () => {
        // The generated client resolves rather than throwing on an HTTP
        // error, so without this the caller would be "signed in" with no user
        // and no token.
        mockSignIn.mockResolvedValue({
            data: undefined,
            error: { detail: 'That Google account has no verified email address.' },
        })

        const { result, onSuccess, onError } = renderMutation()
        result.current.mutate('google-id-token')

        await waitFor(() => expect(onError).toHaveBeenCalled())
        expect(onSuccess).not.toHaveBeenCalled()
        expect(onError.mock.calls[0][0].message).toBe(
            'That Google account has no verified email address.'
        )
    })

    it('still says something useful when the error carries no detail', async () => {
        mockSignIn.mockResolvedValue({ data: undefined, error: {} })

        const { result, onError } = renderMutation()
        result.current.mutate('google-id-token')

        await waitFor(() => expect(onError).toHaveBeenCalled())
        expect(onError.mock.calls[0][0].message).toBe(
            "We couldn't sign you in with Google."
        )
    })
})
