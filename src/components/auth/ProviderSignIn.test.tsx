import { describe, expect, it, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('@/components/auth/AuthContext.tsx', () => ({
    useAuth: () => ({ login: vi.fn() }),
}))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.mock('@/components/auth/useMicrosoftSignInMutation.ts', () => ({
    useMicrosoftSignInMutation: () => ({ mutate: vi.fn() }),
}))
vi.mock('@/components/auth/useGoogleSignInMutation.ts', () => ({
    useGoogleSignInMutation: () => ({ mutate: vi.fn() }),
}))

async function renderWith({ google, microsoft }: {
    google?: string
    microsoft?: string
}) {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', google ?? '')
    vi.stubEnv('VITE_MICROSOFT_CLIENT_ID', microsoft ?? '')
    vi.resetModules()
    const mod = await import('./ProviderSignIn')
    const result = render(
        <MemoryRouter>
            <mod.ProviderSignIn />
        </MemoryRouter>
    )
    return { ...result, mod }
}

describe('ProviderSignIn', () => {
    afterEach(() => {
        vi.unstubAllEnvs()
    })

    it('shows no divider when no provider is configured', async () => {
        // An "or" with nothing above it reads as a page that failed to load.
        const { mod } = await renderWith({})
        expect(screen.queryByText('or')).toBeNull()
        expect(mod.isProviderSignInConfigured).toBe(false)
    })

    it('shows the divider once Microsoft is configured', async () => {
        await renderWith({ microsoft: 'ms-client-id' })
        expect(screen.getByText('or')).toBeInTheDocument()
    })

    it('does not draw a divider for Google until its widget actually arrives', async () => {
        // Google's script is remote and may never load, so being configured is
        // not the same as being on the page. Without this the divider appears
        // above nothing whenever the script is blocked.
        await renderWith({ google: 'google-client-id' })
        expect(screen.queryByText('or')).toBeNull()
    })

    it('names only the providers that are switched on', async () => {
        const onlyMicrosoft = await renderWith({ microsoft: 'ms' })
        expect(onlyMicrosoft.mod.providerNames).toBe('Microsoft')

        const both = await renderWith({ google: 'g', microsoft: 'ms' })
        expect(both.mod.providerNames).toBe('Google or Microsoft')

        const onlyGoogle = await renderWith({ google: 'g' })
        expect(onlyGoogle.mod.providerNames).toBe('Google')
    })

    it('renders the Microsoft button when it is configured', async () => {
        await renderWith({ microsoft: 'ms-client-id' })
        await waitFor(() =>
            expect(
                screen.getByRole('button', { name: /Continue with Microsoft/ })
            ).toBeInTheDocument()
        )
    })
})
