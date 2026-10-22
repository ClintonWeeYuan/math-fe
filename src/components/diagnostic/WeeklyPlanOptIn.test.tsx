import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WeeklyPlanOptIn } from './WeeklyPlanOptIn'

const fetchConsent = vi.fn()
const saveConsent = vi.fn()
vi.mock('@/lib/emailConsentApi.ts', async (orig) => ({
    ...(await orig<typeof import('@/lib/emailConsentApi.ts')>()),
    fetchPlanEmailConsent: () => fetchConsent(),
    savePlanEmailConsent: (...a: unknown[]) => saveConsent(...a),
}))

const WORDING = 'Email me a short plan each Monday until my sitting.'
const show = (props: Partial<Parameters<typeof WeeklyPlanOptIn>[0]> = {}) =>
    render(
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
            <WeeklyPlanOptIn source="my_results" {...props} />
        </QueryClientProvider>
    )

beforeEach(() => {
    fetchConsent.mockReset()
    saveConsent.mockReset()
})

describe('WeeklyPlanOptIn', () => {
    it('is not offered while the email is switched off', async () => {
        fetchConsent.mockResolvedValue({ optedIn: false, wording: WORDING, available: false })
        const { container } = show()
        await new Promise((r) => setTimeout(r, 0))
        expect(container).toBeEmptyDOMElement()
    })

    it('asks, with the wording that is stored as consent, and saves a yes with where it was asked', async () => {
        fetchConsent.mockResolvedValue({ optedIn: false, wording: WORDING, available: true })
        saveConsent.mockResolvedValue({ optedIn: true, wording: WORDING, available: true })
        show()
        expect(await screen.findByText('Want a short plan each Monday until the January sitting?')).toBeInTheDocument()
        expect(screen.getByText(WORDING)).toBeInTheDocument()
        await userEvent.click(screen.getByRole('button', { name: 'Yes, send it' }))
        expect(saveConsent).toHaveBeenCalledWith(true, 'my_results')
        expect(await screen.findByText(/arrives each Monday/)).toBeInTheDocument()
    })

    it('records nothing for "No thanks"', async () => {
        fetchConsent.mockResolvedValue({ optedIn: false, wording: WORDING, available: true })
        const { container } = show()
        await userEvent.click(await screen.findByRole('button', { name: 'No thanks' }))
        expect(saveConsent).not.toHaveBeenCalled()
        expect(container).toBeEmptyDOMElement()
    })

    it('lets a student who said yes stop it', async () => {
        fetchConsent.mockResolvedValue({ optedIn: true, wording: WORDING, available: true })
        saveConsent.mockResolvedValue({ optedIn: false, wording: WORDING, available: true })
        show({ source: 'start_screen', compact: true })
        await userEvent.click(await screen.findByRole('button', { name: 'Stop the weekly plan' }))
        expect(saveConsent).toHaveBeenCalledWith(false, 'start_screen')
    })
})
