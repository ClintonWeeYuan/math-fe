import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { LoginPage } from '@/pages/Auth/LoginPage.tsx'

// Google's widget loads a remote script; the page's wording is what is under
// test, so it is stood in for with a plain button.
vi.mock('@/components/auth/GoogleSignInButton.tsx', () => ({
    isGoogleSignInConfigured: true,
    GoogleSignInButton: () => <button type="button">Continue with Google</button>,
}))

const mockTrack = vi.fn()
vi.mock('@/lib/analytics.ts', () => ({ trackEvent: (...a: unknown[]) => mockTrack(...a) }))

function SignupProbe() {
    const location = useLocation()
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname
    return <p>signup page, back to {from ?? 'nowhere'}</p>
}

function renderLogin() {
    const client = new QueryClient()
    return render(
        <QueryClientProvider client={client}>
            <MemoryRouter
                initialEntries={[
                    { pathname: '/auth/login', state: { from: { pathname: '/diagnostic/sets/abc' } } },
                ]}
            >
                <Routes>
                    <Route path="/auth/login" element={<LoginPage />} />
                    <Route path="/auth/signup" element={<SignupProbe />} />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    )
}

describe('the login page, for someone without an account', () => {
    it('says it is also where a free account is made', () => {
        renderLogin()
        expect(screen.getByText('Sign in or create a free account')).toBeInTheDocument()
        expect(
            screen.getByText(/New here\? Continue with Google/)
        ).toBeInTheDocument()
        expect(screen.queryByText('Welcome!')).not.toBeInTheDocument()
    })

    it('shows the new-account notice with both legal pages', () => {
        renderLogin()
        expect(screen.getByRole('link', { name: 'Terms of Use' })).toHaveAttribute('href', '/terms')
        expect(screen.getByRole('link', { name: 'Privacy Notice' })).toHaveAttribute('href', '/privacy')
    })

    it('keeps the notice when the student switches to an emailed code', async () => {
        renderLogin()
        await userEvent.click(screen.getByRole('button', { name: /Email me a sign-in code/ }))
        expect(screen.getByRole('link', { name: 'Terms of Use' })).toBeInTheDocument()
    })

    it('sends a password sign-up back to the paper they came from', async () => {
        renderLogin()
        await userEvent.click(screen.getByRole('button', { name: 'Create one' }))
        expect(screen.getByText('signup page, back to /diagnostic/sets/abc')).toBeInTheDocument()
    })

    it('records that the page was shown, and where from', () => {
        renderLogin()
        expect(mockTrack).toHaveBeenCalledWith('auth_page_viewed', {
            metadata: { page: 'login', from: '/diagnostic/sets/abc' },
        })
    })
})
