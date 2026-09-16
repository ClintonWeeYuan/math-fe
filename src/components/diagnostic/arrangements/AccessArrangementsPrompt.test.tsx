import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { AccessArrangementsPrompt } from '@/components/diagnostic/arrangements/AccessArrangementsPrompt.tsx'
import { mustAnswerArrangements, type MyArrangements } from '@/lib/accommodationsApi.ts'

const mockDeclare = vi.fn()
vi.mock('@/lib/accommodationsApi.ts', async () => {
    const actual = await vi.importActual<typeof import('@/lib/accommodationsApi.ts')>(
        '@/lib/accommodationsApi.ts'
    )
    return { ...actual, declareMyArrangements: (...a: unknown[]) => mockDeclare(...a) }
})
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const NOT_ASKED: MyArrangements = { answered: false, extraTimePercent: 0, breakBudgetMinutes: 0 }

function wrap(ui: ReactNode) {
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

beforeEach(() => {
    mockDeclare.mockReset()
    mockDeclare.mockImplementation(async (input) => ({ answered: true, ...input }))
})

describe('asking about access arrangements', () => {
    it('asks a student who has not answered yet, naming their test', () => {
        wrap(<AccessArrangementsPrompt arrangements={NOT_ASKED} testName="TMUA" />)
        expect(
            screen.getByRole('heading', {
                name: 'Before you start: do you have access arrangements for the TMUA?',
            })
        ).toBeInTheDocument()
    })

    it('records "no" without asking for a declaration', async () => {
        wrap(<AccessArrangementsPrompt arrangements={NOT_ASKED} testName="ESAT" />)
        await userEvent.click(screen.getByRole('button', { name: /No, I don/ }))
        await waitFor(() => expect(mockDeclare).toHaveBeenCalledTimes(1))
        expect(mockDeclare.mock.calls[0][0]).toEqual({
            extraTimePercent: 0,
            breakBudgetMinutes: 0,
            confirmed: false,
        })
    })

    it('"yes" opens the form, with the usual 25% preselected', async () => {
        wrap(<AccessArrangementsPrompt arrangements={NOT_ASKED} testName="ESAT" />)
        await userEvent.click(screen.getByRole('button', { name: 'Yes, I do' }))
        expect(screen.getByRole('form', { name: 'Your access arrangements' })).toBeInTheDocument()
        expect(screen.getByLabelText('Extra time')).toHaveValue('25')
    })

    it('will not save a claim until the student confirms it', async () => {
        wrap(<AccessArrangementsPrompt arrangements={NOT_ASKED} testName="ESAT" />)
        await userEvent.click(screen.getByRole('button', { name: 'Yes, I do' }))
        const save = screen.getByRole('button', { name: 'Save my arrangements' })
        expect(save).toBeDisabled()

        await userEvent.selectOptions(screen.getByLabelText(/Rest breaks/), '10')
        await userEvent.click(screen.getByRole('checkbox', { name: 'Confirm your arrangements' }))
        expect(save).toBeEnabled()
        await userEvent.click(save)

        await waitFor(() => expect(mockDeclare).toHaveBeenCalledTimes(1))
        expect(mockDeclare.mock.calls[0][0]).toMatchObject({
            extraTimePercent: 25,
            breakBudgetMinutes: 10,
            confirmed: true,
        })
    })

    it('reminds a student what they have, and lets them change it', async () => {
        wrap(
            <AccessArrangementsPrompt
                arrangements={{ answered: true, extraTimePercent: 25, breakBudgetMinutes: 10 }}
                testName="ESAT"
            />
        )
        expect(screen.getByText('25% extra time · 10 min of rest breaks')).toBeInTheDocument()
        expect(screen.queryByRole('heading', { name: /Before you start/ })).not.toBeInTheDocument()

        await userEvent.click(screen.getByRole('button', { name: 'Change' }))
        expect(screen.getByLabelText('Extra time')).toHaveValue('25')
        await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
        expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument()
    })

    it('reminds a student who said no that they have none', () => {
        wrap(
            <AccessArrangementsPrompt
                arrangements={{ answered: true, extraTimePercent: 0, breakBudgetMinutes: 0 }}
                testName="ESAT"
            />
        )
        expect(screen.getByText('none')).toBeInTheDocument()
    })
})

describe('holding the start button', () => {
    it('holds it until a signed-in student has answered', () => {
        expect(
            mustAnswerArrangements({ signedIn: true, loadFailed: false, arrangements: NOT_ASKED })
        ).toBe(true)
        expect(
            mustAnswerArrangements({ signedIn: true, loadFailed: false, arrangements: undefined })
        ).toBe(true)
        expect(
            mustAnswerArrangements({
                signedIn: true,
                loadFailed: false,
                arrangements: { ...NOT_ASKED, answered: true },
            })
        ).toBe(false)
    })

    it('never holds up a visitor, or a student whose answer cannot be loaded', () => {
        expect(
            mustAnswerArrangements({ signedIn: false, loadFailed: false, arrangements: undefined })
        ).toBe(false)
        expect(
            mustAnswerArrangements({ signedIn: true, loadFailed: true, arrangements: undefined })
        ).toBe(false)
    })
})
