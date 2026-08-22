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

vi.mock('@azure/msal-browser', () => ({
    PublicClientApplication: class {
        async initialize() {}
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

    it('says nothing when the person closes the popup', async () => {
        // Changing your mind is a decision, not an error.
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
