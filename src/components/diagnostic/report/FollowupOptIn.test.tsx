import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FollowupOptIn } from './FollowupOptIn'

/**
 * The follow-up email is marketing, so it stays opt-in — but as a question
 * with two answers, not a box five students in 218 ever ticked.
 */

const mockConsent = vi.fn()
const mockSave = vi.fn()
vi.mock('@/lib/emailConsentApi.ts', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/lib/emailConsentApi.ts')>()),
    fetchEmailConsent: () => mockConsent(),
    saveEmailConsent: (...a: unknown[]) => mockSave(...a),
}))

const WORDING = 'Email me tomorrow about this paper.'
const show = () =>
    render(
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
            <FollowupOptIn />
        </QueryClientProvider>
    )

beforeEach(() => {
    mockConsent.mockReset()
    mockSave.mockReset()
})

describe('the follow-up email question on a report', () => {
    it('asks a question, shows the stored wording, and saves a yes as from the report', async () => {
        mockConsent.mockResolvedValue({ optedIn: false, wording: WORDING })
        mockSave.mockResolvedValue({ optedIn: true, wording: WORDING })
        show()
        expect(await screen.findByText('Want a short email about this paper tomorrow?')).toBeInTheDocument()
        expect(screen.getByText(WORDING)).toBeInTheDocument()
        await userEvent.click(screen.getByRole('button', { name: 'Yes, email me tomorrow' }))
        expect(mockSave).toHaveBeenCalledWith(true, 'report')
        expect(await screen.findByText(/we'll email you tomorrow about this paper/)).toBeInTheDocument()
    })

    it('lets someone who said yes stop it', async () => {
        mockConsent.mockResolvedValue({ optedIn: true, wording: WORDING })
        mockSave.mockResolvedValue({ optedIn: false, wording: WORDING })
        show()
        await userEvent.click(await screen.findByRole('button', { name: 'Stop this email' }))
        expect(mockSave).toHaveBeenCalledWith(false, 'report')
    })

    it('"No thanks" hides it and records nothing', async () => {
        mockConsent.mockResolvedValue({ optedIn: false, wording: WORDING })
        show()
        await userEvent.click(await screen.findByRole('button', { name: 'No thanks' }))
        expect(mockSave).not.toHaveBeenCalled()
        expect(screen.queryByText(WORDING)).not.toBeInTheDocument()
    })
})
