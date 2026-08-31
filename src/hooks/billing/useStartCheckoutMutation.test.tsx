import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import useStartCheckoutMutation from './useStartCheckoutMutation'

const mockCreate = vi.fn()
const mockErrorToast = vi.fn()
const mockSuccessToast = vi.fn()

vi.mock('@/lib/billingApi.ts', () => ({
    createCheckoutSession: (...a: unknown[]) => mockCreate(...a),
}))
vi.mock('sonner', () => ({
    toast: {
        error: (...a: unknown[]) => mockErrorToast(...a),
        success: (...a: unknown[]) => mockSuccessToast(...a),
    },
}))

const assign = vi.fn()

function wrapper({ children }: { children: ReactNode }) {
    const client = new QueryClient({
        defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    })
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

function err(status: number, message = 'boom') {
    return Object.assign(new Error(message), { status })
}

beforeEach(() => {
    mockCreate.mockReset()
    mockErrorToast.mockReset()
    mockSuccessToast.mockReset()
    assign.mockReset()
    Object.defineProperty(window, 'location', {
        configurable: true,
        value: { assign, pathname: '/diagnostics/esat', reload: vi.fn() },
    })
})

describe('useStartCheckoutMutation', () => {
    it('hands the browser to Stripe', async () => {
        // The whole point of doing this inside the hook: a caller that
        // created a Session and forgot to navigate would leave a student who
        // clicked "unlock" watching nothing happen.
        mockCreate.mockResolvedValue('https://checkout.stripe.com/c/pay/cs_1')
        const { result } = renderHook(() => useStartCheckoutMutation(), { wrapper })

        act(() => result.current.mutate({}))

        await waitFor(() =>
            expect(assign).toHaveBeenCalledWith(
                'https://checkout.stripe.com/c/pay/cs_1'
            )
        )
    })

    it('passes the chosen season through', async () => {
        mockCreate.mockResolvedValue('https://x')
        const { result } = renderHook(() => useStartCheckoutMutation(), { wrapper })

        act(() => result.current.mutate({ season: 'jan-2027' }))

        await waitFor(() =>
            expect(mockCreate).toHaveBeenCalledWith('jan-2027', '/diagnostics/esat')
        )
    })

    it('defaults the return path to the page the student is on', async () => {
        mockCreate.mockResolvedValue('https://x')
        const { result } = renderHook(() => useStartCheckoutMutation(), { wrapper })

        act(() => result.current.mutate({}))

        await waitFor(() =>
            expect(mockCreate).toHaveBeenCalledWith(undefined, '/diagnostics/esat')
        )
    })

    it('prefers an explicit return path', async () => {
        mockCreate.mockResolvedValue('https://x')
        const { result } = renderHook(() => useStartCheckoutMutation(), { wrapper })

        act(() =>
            result.current.mutate({
                season: 'oct-2026',
                returnPath: '/diagnostic/attempts/a1/report',
            })
        )

        await waitFor(() =>
            expect(mockCreate).toHaveBeenCalledWith(
                'oct-2026',
                '/diagnostic/attempts/a1/report'
            )
        )
    })

    it('treats an already-covered season as good news, not an error', async () => {
        // They are not being told off for clicking; what they were about to
        // buy is already covered by something they hold.
        mockCreate.mockRejectedValue(err(409, 'Your current pass already covers October 2026.'))
        const { result } = renderHook(() => useStartCheckoutMutation(), { wrapper })

        act(() => result.current.mutate({}))

        await waitFor(() => expect(mockSuccessToast).toHaveBeenCalled())
        expect(mockErrorToast).not.toHaveBeenCalled()
        expect(assign).not.toHaveBeenCalled()
    })

    it('does not blame the student when billing is unconfigured', async () => {
        // 503 is our deployment missing its Stripe keys. "Your payment
        // failed" would be a lie about their card.
        mockCreate.mockRejectedValue(err(503))
        const { result } = renderHook(() => useStartCheckoutMutation(), { wrapper })

        act(() => result.current.mutate({}))

        await waitFor(() => expect(mockErrorToast).toHaveBeenCalled())
        expect(String(mockErrorToast.mock.calls[0][0])).toMatch(/switched on/i)
    })

    it('surfaces the backend wording for anything else', async () => {
        mockCreate.mockRejectedValue(err(500, 'Couldn’t reach the payment provider.'))
        const { result } = renderHook(() => useStartCheckoutMutation(), { wrapper })

        act(() => result.current.mutate({}))

        await waitFor(() =>
            expect(mockErrorToast).toHaveBeenCalledWith(
                'Couldn’t reach the payment provider.'
            )
        )
    })
})
