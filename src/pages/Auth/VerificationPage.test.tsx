import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { VerificationPage } from './VerificationPage'
import { emailInToken } from '@/lib/verificationLink.ts'

/**
 * Where the sign-up email's link lands. It used to say "Verifying…" for ever
 * on failure. Now a failed link says why and offers a new one, and an
 * already-verified account is sent to sign in.
 */

const mockVerify = vi.fn()
const mockResend = vi.fn()
vi.mock('@/client', () => ({
    verifyEmailUsersVerifyPost: (...a: unknown[]) => mockVerify(...a),
    resendVerificationUsersResendVerificationPost: (...a: unknown[]) => mockResend(...a),
}))

const mockLogin = vi.fn()
vi.mock('@/components/auth/AuthContext.tsx', () => ({
    useAuth: () => ({ login: mockLogin, user: null, isLoading: false }),
}))

const mockTrackFailed = vi.fn()
vi.mock('@/lib/authFunnel.ts', () => ({
    trackAuthFailed: (...a: unknown[]) => mockTrackFailed(...a),
}))
vi.mock('@/lib/analytics.ts', () => ({ trackEvent: vi.fn() }))

// A token whose payload names an email, signature irrelevant.
const TOKEN = `x.${btoa(JSON.stringify({ email: 'amira@example.com' }))}.y`

function show(path = `/auth/verify?token=${TOKEN}`) {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    return render(
        <QueryClientProvider client={client}>
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path="/auth/verify" element={<VerificationPage />} />
                    <Route path="/auth/login" element={<p>login page</p>} />
                    <Route path="/auth/more-info" element={<p>more info page</p>} />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    )
}

describe('VerificationPage', () => {
    beforeEach(() => {
        mockVerify.mockReset()
        mockResend.mockReset()
        mockLogin.mockReset()
        mockTrackFailed.mockReset()
    })

    it('reads the email out of the link without trusting it', () => {
        expect(emailInToken(TOKEN)).toBe('amira@example.com')
        expect(emailInToken('not-a-token')).toBe('')
        expect(emailInToken(null)).toBe('')
    })

    it('says what went wrong and offers a new link, prefilled from the token', async () => {
        mockVerify.mockResolvedValue({ error: { detail: 'Verification link expired' }, data: undefined })
        mockResend.mockResolvedValue({ data: { message: 'sent' } })
        show()

        expect(await screen.findByText("That link didn't work")).toBeInTheDocument()
        expect(screen.getByText('Verification link expired')).toBeInTheDocument()
        expect(mockTrackFailed).toHaveBeenCalled()

        const box = screen.getByLabelText('Send me a new link') as HTMLInputElement
        expect(box.value).toBe('amira@example.com')
        fireEvent.click(screen.getByRole('button', { name: 'Send a new link' }))
        await waitFor(() => expect(mockResend).toHaveBeenCalledWith({ query: { email: 'amira@example.com' } }))
        expect(await screen.findByText(/Sent\. Check your inbox/)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /sign in with Google or a one-time code/ })).toHaveAttribute('href', '/auth/login')
    })

    it('turns a server error with no sentence into a message rather than silence', async () => {
        mockVerify.mockResolvedValue({ error: 'Internal Server Error', data: undefined })
        show()
        expect(await screen.findByText('Verification failed')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Send a new link' })).toBeInTheDocument()
    })

    it('sends an already-verified account to sign in instead of signing it in', async () => {
        mockVerify.mockResolvedValue({ data: { message: 'already', redirect: true, token: null, user: null } })
        show()
        expect(await screen.findByText('login page')).toBeInTheDocument()
        expect(mockLogin).not.toHaveBeenCalled()
    })

    it('signs a freshly verified student in and sends them on', async () => {
        mockVerify.mockResolvedValue({
            data: { message: 'done', redirect: true, token: 'session', user: { id: 'u', name: 'Amira', email: 'a@x', userType: 'USER' } },
        })
        mockLogin.mockImplementation(({ callback }: { callback: () => void }) => callback())
        show()
        expect(await screen.findByText('more info page')).toBeInTheDocument()
    })

    it('handles a link with no code at all', () => {
        show('/auth/verify')
        expect(screen.getByText(/missing its code/)).toBeInTheDocument()
        expect(mockVerify).not.toHaveBeenCalled()
    })
})
