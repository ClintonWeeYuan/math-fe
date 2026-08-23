import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

const mockSignIn = vi.fn()
const mockLoginPopup = vi.fn()
const mockToastError = vi.fn()
const mockLogin = vi.fn()

vi.mock('sonner', () => ({
    toast: { error: (m: string) => mockToastError(m), success: vi.fn() },
}))

vi.mock('@/components/auth/AuthContext.tsx', () => ({
    useAuth: () => ({ login: mockLogin }),
}))

vi.mock('@/components/auth/useMicrosoftSignInMutation.ts', () => ({
    useMicrosoftSignInMutation: () => ({ mutate: mockSignIn }),
}))

const mockInitialize = vi.fn()
const mockHandleRedirect = vi.fn().mockResolvedValue(null)

vi.mock('@azure/msal-browser', () => ({
    PublicClientApplication: class {
        async initialize() {
            mockInitialize()
        }
        async handleRedirectPromise() {
            return mockHandleRedirect()
        }
        async loginPopup(request: unknown) {
            return mockLoginPopup(request)
        }
    },
}))

async function renderButton() {
    vi.stubEnv('VITE_MICROSOFT_CLIENT_ID', 'a-client-id')
    vi.resetModules()
    const mod = await import('./MicrosoftSignInButton')
    mod.resetMsalForTests()
    render(
        <MemoryRouter>
            <mod.MicrosoftSignInButton />
        </MemoryRouter>
    )
    return mod
}

describe('MicrosoftSignInButton', () => {
    beforeEach(() => {
        mockSignIn.mockReset()
        mockLoginPopup.mockReset()
        mockToastError.mockReset()
        mockInitialize.mockReset()
        mockHandleRedirect.mockReset().mockResolvedValue(null)
    })

    afterEach(() => {
        vi.unstubAllEnvs()
    })

    it('renders nothing at all when no client id is configured', async () => {
        vi.stubEnv('VITE_MICROSOFT_CLIENT_ID', '')
        vi.resetModules()
        const mod = await import('./MicrosoftSignInButton')
        const { container } = render(
            <MemoryRouter>
                <mod.MicrosoftSignInButton />
            </MemoryRouter>
        )
        // A button that cannot work is worse than no button — everything
        // beside it still signs people in.
        expect(container).toBeEmptyDOMElement()
        expect(mod.isMicrosoftSignInConfigured).toBe(false)
    })

    it('exchanges the Microsoft token for one of ours', async () => {
        mockLoginPopup.mockResolvedValue({ idToken: 'ms-id-token' })
        await renderButton()

        await userEvent.click(screen.getByRole('button'))

        await waitFor(() => expect(mockSignIn).toHaveBeenCalled())
        expect(mockSignIn.mock.calls[0][0].credential).toBe('ms-id-token')
    })

    it('sends a fresh nonce and asks Microsoft to stamp that same one in', async () => {
        // The binding between the sign-in the browser started and the token it
        // posts back. Sending one value and asking for another would pass every
        // other test here and fail every real sign-in.
        mockLoginPopup.mockResolvedValue({ idToken: 'ms-id-token' })
        await renderButton()

        await userEvent.click(screen.getByRole('button'))

        await waitFor(() => expect(mockSignIn).toHaveBeenCalled())
        const asked = mockLoginPopup.mock.calls[0][0].nonce
        expect(asked).toBeTruthy()
        expect(mockSignIn.mock.calls[0][0].nonce).toBe(asked)
    })

    it('asks for the account picker every time', async () => {
        // Without it a shared or school machine silently signs the previous
        // person back in — on a page whose whole job is identity.
        mockLoginPopup.mockResolvedValue({ idToken: 't' })
        await renderButton()

        await userEvent.click(screen.getByRole('button'))

        await waitFor(() => expect(mockLoginPopup).toHaveBeenCalled())
        expect(mockLoginPopup.mock.calls[0][0].prompt).toBe('select_account')
    })

    it('opens the popup without awaiting anything first', async () => {
        // The bug this exists for. A browser only allows window.open from
        // inside a user gesture, and an `await` before it ends the gesture.
        // Loading MSAL in the click handler put loginPopup one microtask past
        // the click, so the popup was blocked every time and not one request
        // ever reached Microsoft.
        //
        // Asserting it synchronously — no waitFor, no await between the click
        // and the check — is the only way to state that rule as a test.
        mockLoginPopup.mockResolvedValue({ idToken: 't' })
        await renderButton()
        // Let the mount-time preload settle, which is the point: by click
        // time the instance is already in hand.
        await waitFor(() => expect(mockInitialize).toHaveBeenCalled())

        screen.getByRole('button').click()

        expect(mockLoginPopup).toHaveBeenCalled()
    })

    it('tells the person their browser blocked the window, not that Microsoft is unreachable', async () => {
        // These two failures need different words: one is fixed by allowing
        // pop-ups, the other by waiting. Saying "we couldn't reach Microsoft"
        // for a popup that never opened sends people to check their wifi.
        mockLoginPopup.mockRejectedValue({ errorCode: 'popup_window_error' })
        await renderButton()

        await userEvent.click(screen.getByRole('button'))

        await waitFor(() => expect(mockToastError).toHaveBeenCalled())
        expect(mockToastError.mock.calls[0][0]).toMatch(/blocked|pop-ups/i)
    })

    it('treats an empty popup window the same way', async () => {
        mockLoginPopup.mockRejectedValue({ errorCode: 'empty_window_error' })
        await renderButton()

        await userEvent.click(screen.getByRole('button'))

        await waitFor(() => expect(mockToastError).toHaveBeenCalled())
        expect(mockToastError.mock.calls[0][0]).toMatch(/blocked|pop-ups/i)
    })

    it('logs the real error rather than swallowing it', async () => {
        // Diagnosing the blocked popup meant reading the deployed bundle,
        // because the app caught the error and threw it away.
        const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        const failure = { errorCode: 'something_new', errorMessage: 'details' }
        mockLoginPopup.mockRejectedValue(failure)
        await renderButton()

        await userEvent.click(screen.getByRole('button'))

        await waitFor(() => expect(consoleError).toHaveBeenCalled())
        expect(consoleError.mock.calls[0]).toContain(failure)
        consoleError.mockRestore()
    })

    describe('a sign-in that never finished', () => {
        // MSAL records an interaction in sessionStorage before opening the
        // popup and clears it when the popup returns. A popup that dies
        // without returning — which is exactly what Microsoft's own error page
        // does — leaves the flag set, and every later attempt in that tab
        // fails with interaction_in_progress. sessionStorage survives a
        // reload, so refreshing does not help. Only closing the tab does,
        // which is not something to ask a student to work out.

        it('clears stale interaction state when it loads', async () => {
            await renderButton()
            await waitFor(() => expect(mockHandleRedirect).toHaveBeenCalled())
        })

        it('asks the person to press again rather than blaming Microsoft', async () => {
            mockLoginPopup.mockRejectedValue({
                errorCode: 'interaction_in_progress',
            })
            await renderButton()

            await userEvent.click(screen.getByRole('button'))

            await waitFor(() => expect(mockToastError).toHaveBeenCalled())
            expect(mockToastError.mock.calls[0][0]).toMatch(/press the button again/i)
        })

        it('clears the state so that the next press works', async () => {
            mockLoginPopup.mockRejectedValue({
                errorCode: 'interaction_in_progress',
            })
            await renderButton()
            await waitFor(() => expect(mockHandleRedirect).toHaveBeenCalled())
            const atLoad = mockHandleRedirect.mock.calls.length

            await userEvent.click(screen.getByRole('button'))

            // Called again, on the failure — otherwise the advice to press
            // again is advice to hit the same wall twice.
            await waitFor(() =>
                expect(mockHandleRedirect.mock.calls.length).toBeGreaterThan(atLoad)
            )
        })

        it('leaves the button pressable', async () => {
            mockLoginPopup.mockRejectedValue({
                errorCode: 'interaction_in_progress',
            })
            await renderButton()

            await userEvent.click(screen.getByRole('button'))

            await waitFor(() =>
                expect(screen.getByRole('button')).not.toBeDisabled()
            )
        })
    })

    it('says nothing when the person closes the popup', async () => {
        // Changing your mind is a decision, not an error. Only this one code
        // is silent — popup_window_error used to be treated as a cancellation
        // too, which hid a real failure behind somebody's imagined choice.
        mockLoginPopup.mockRejectedValue({ errorCode: 'user_cancelled' })
        await renderButton()

        await userEvent.click(screen.getByRole('button'))

        await waitFor(() =>
            expect(screen.getByRole('button')).not.toBeDisabled()
        )
        expect(mockToastError).not.toHaveBeenCalled()
        expect(mockSignIn).not.toHaveBeenCalled()
    })

    it('explains itself when Microsoft cannot be reached', async () => {
        mockLoginPopup.mockRejectedValue(new Error('network down'))
        await renderButton()

        await userEvent.click(screen.getByRole('button'))

        await waitFor(() => expect(mockToastError).toHaveBeenCalled())
        expect(mockToastError.mock.calls[0][0]).toContain('Microsoft')
    })

    it('does not sign anyone in when the popup returns no token', async () => {
        mockLoginPopup.mockResolvedValue({ idToken: undefined })
        await renderButton()

        await userEvent.click(screen.getByRole('button'))

        await waitFor(() => expect(mockToastError).toHaveBeenCalled())
        expect(mockSignIn).not.toHaveBeenCalled()
    })

    it('re-enables itself after a failure so the person can try again', async () => {
        mockLoginPopup.mockRejectedValue(new Error('network down'))
        await renderButton()

        await userEvent.click(screen.getByRole('button'))

        await waitFor(() =>
            expect(screen.getByRole('button')).not.toBeDisabled()
        )
    })
})
