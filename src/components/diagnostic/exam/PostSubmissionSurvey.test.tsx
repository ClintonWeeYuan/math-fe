import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AttemptClosedView } from './AttemptClosedView'
import { client } from '@/client/client.gen'

/**
 * The survey's one hard requirement is that it cannot stand between a student
 * and the report they have just spent forty minutes earning. These tests are
 * mostly about that: the report button works whatever the survey is doing, and
 * a failing save is invisible.
 */

let sets: unknown[] | undefined
let coveredTests: string[] | undefined
vi.mock('@/hooks/diagnostic/useListPublishedSetsQuery.ts', () => ({
    default: () => ({ data: sets }),
}))
vi.mock('@/hooks/billing/useBillingStatusQuery.ts', () => ({
    default: () => ({
        data: coveredTests === undefined ? undefined : { hasPass: coveredTests.length > 0, coveredTests, seasons: [] },
    }),
}))
vi.mock('@/lib/billing.ts', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/lib/billing.ts')>()),
    BILLING_LIVE: true,
}))
const mockConsent = vi.fn()
const mockSaveConsent = vi.fn()
vi.mock('@/lib/emailConsentApi.ts', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/lib/emailConsentApi.ts')>()),
    fetchEmailConsent: () => mockConsent(),
    saveEmailConsent: (...a: unknown[]) => mockSaveConsent(...a),
}))

const post = vi.spyOn(client, 'post')
const get = vi.spyOn(client, 'get')

const attempt = {
    id: 'att-1',
    diagnosticSetId: 'set-1',
    status: 'submitted',
    startedAt: '2026-08-20T10:00:00Z',
    serverDeadlineAt: '2026-08-20T10:40:00Z',
    submittedAt: '2026-08-20T10:35:00Z',
    agreedToTerms: true,
    totalScore: 14,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any

const show = () =>
    render(
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
            <MemoryRouter>
                <AttemptClosedView attempt={attempt} />
            </MemoryRouter>
        </QueryClientProvider>
    )

beforeEach(() => {
    post.mockReset()
    post.mockResolvedValue({ data: { message: 'ok' } } as never)
    get.mockReset()
    get.mockResolvedValue({ data: { country: null } } as never)
    localStorage.clear()
    sets = undefined
    coveredTests = undefined
    mockConsent.mockReset()
    mockConsent.mockResolvedValue({ optedIn: false, wording: 'Email me tomorrow about this paper.' })
    mockSaveConsent.mockReset()
    mockSaveConsent.mockResolvedValue({ optedIn: true, wording: 'Email me tomorrow about this paper.' })
})

describe('the country question', () => {
    it('is asked when no country is stored, and saved when picked', async () => {
        show()
        const picker = await screen.findByRole('combobox', {
            name: /which country are you in/i,
        })
        await userEvent.click(picker)
        await userEvent.click(await screen.findByText('Malaysia'))

        expect(post).toHaveBeenCalledWith(
            expect.objectContaining({ body: { country: 'MY' } })
        )
        // Still on screen after answering, showing the answer.
        expect(
            screen.getByRole('combobox', { name: /which country are you in/i })
        ).toBeInTheDocument()
    })

    it('is not asked again once a country is stored', async () => {
        get.mockResolvedValue({ data: { country: 'GB' } } as never)
        show()
        await vi.waitFor(() => expect(get).toHaveBeenCalled())
        // Give the read a tick to land.
        await new Promise((r) => setTimeout(r, 0))
        expect(screen.queryByText(/which country are you in/i)).not.toBeInTheDocument()
    })

    it('is asked if the stored answers cannot be read', async () => {
        get.mockRejectedValue(new Error('offline'))
        show()
        expect(await screen.findByText(/which country are you in/i)).toBeInTheDocument()
    })
})

describe('the survey after a submission', () => {
    it('never gets between the student and their report', async () => {
        show()
        // Present before answering anything, and not disabled.
        const report = screen.getByRole('button', { name: /view your report/i })
        expect(report).toBeEnabled()

        await userEvent.click(screen.getByRole('button', { name: 'October 2026 (already sat)' }))
        expect(
            screen.getByRole('button', { name: /view your report/i })
        ).toBeEnabled()
    })

    it('records a sitting as soon as it is tapped — no submit step', async () => {
        show()
        await userEvent.click(screen.getByRole('button', { name: 'January 2027' }))

        expect(post).toHaveBeenCalledTimes(1)
        expect(post.mock.calls[0][0].body).toEqual({
            testSitting: 'january_2027',
        })
    })

    it('sends the whole university selection, not just the last tap', async () => {
        show()
        await userEvent.click(screen.getByRole('button', { name: 'Cambridge' }))
        await userEvent.click(screen.getByRole('button', { name: 'Imperial' }))

        const last = post.mock.calls[post.mock.calls.length - 1]
        expect(last[0].body).toEqual({
            targetUniversities: ['Cambridge', 'Imperial'],
        })
    })

    it('lets a university be deselected', async () => {
        show()
        await userEvent.click(screen.getByRole('button', { name: 'Oxford' }))
        await userEvent.click(screen.getByRole('button', { name: 'Oxford' }))

        const last = post.mock.calls[post.mock.calls.length - 1]
        expect(last[0].body).toEqual({
            targetUniversities: [],
        })
    })

    it('skipping removes it and asks nothing further', async () => {
        show()
        await userEvent.click(screen.getByRole('button', { name: 'Skip' }))

        expect(
            screen.queryByText(/when are you sitting the test/i)
        ).not.toBeInTheDocument()
        // Skipping is not an answer, so nothing is recorded.
        expect(post).not.toHaveBeenCalled()
        // And the report is still one click away.
        expect(
            screen.getByRole('button', { name: /view your report/i })
        ).toBeEnabled()
    })

    it('says nothing to the student when a save fails', async () => {
        post.mockRejectedValue(new Error('offline'))
        show()
        await userEvent.click(screen.getByRole('button', { name: 'Not decided' }))

        // The selection still shows as made, and no error surfaces: a survey
        // answer is not worth an error message on this screen.
        expect(screen.getByRole('button', { name: 'Not decided' })).toHaveAttribute(
            'aria-pressed',
            'true'
        )
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
})

describe('the follow-up email question', () => {
    const freeFull = { id: 'set-1', title: 'ESAT Math 1 — Diagnostic Set A', subject: 'ESAT Math 1', isFree: true }

    it('is asked after a free full paper, and a yes is saved as from the survey', async () => {
        sets = [freeFull]
        coveredTests = []
        show()
        await userEvent.click(await screen.findByRole('button', { name: 'Yes, email me tomorrow' }))
        expect(mockSaveConsent).toHaveBeenCalledWith(true, 'survey')
        expect(await screen.findByText(/we'll email you tomorrow about this paper/)).toBeInTheDocument()
    })

    it('is not asked after a mini, a paid paper, or by a pass holder', async () => {
        for (const [s, c] of [
            [[{ ...freeFull, format: 'mini' }], []],
            [[{ ...freeFull, isFree: false }], []],
            [[freeFull], ['esat']],
        ] as const) {
            sets = [...s]
            coveredTests = [...c]
            const { unmount } = show()
            await screen.findByText(/When are you sitting the test/)
            expect(screen.queryByText('Want a short email about this paper tomorrow?')).not.toBeInTheDocument()
            unmount()
        }
    })

    it('is not asked again once they have said yes', async () => {
        sets = [freeFull]
        coveredTests = []
        mockConsent.mockResolvedValue({ optedIn: true, wording: 'Email me tomorrow about this paper.' })
        show()
        await screen.findByText(/When are you sitting the test/)
        expect(screen.queryByRole('button', { name: 'Yes, email me tomorrow' })).not.toBeInTheDocument()
    })

    it('"No thanks" records nothing', async () => {
        sets = [freeFull]
        coveredTests = []
        show()
        await userEvent.click(await screen.findByRole('button', { name: 'No thanks' }))
        expect(mockSaveConsent).not.toHaveBeenCalled()
        expect(screen.queryByText('Want a short email about this paper tomorrow?')).not.toBeInTheDocument()
    })
})
