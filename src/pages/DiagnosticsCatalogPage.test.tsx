import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DiagnosticsCatalogPage } from './DiagnosticsCatalogPage'
import type { PublishedDiagnosticSet } from '@/client'

const mockSets = vi.fn()
const mockNavigate = vi.fn()

/** Flipped per test. A module constant read at import time, so it has to be
 *  reached through a getter rather than reassigned on the real module. */
let billingLive = false
/** Which tests the signed-in student holds a live pass for. Not a single
 *  boolean, because that is precisely the bug: passes are per test, and a
 *  catalogue keyed on "holds anything" offered an ESAT holder a paid TMUA
 *  paper and let the server refuse it. */
let coveredTests: string[] = []
/** Whether anything is still on sale. */
let seasonsOnSale = true
/** Whether anyone is signed in at all. */
let signedIn = false

// Only the flag is faked — seasonAccessNote is real formatting, and a stub
// would let the wording drift from what a student actually sees.
vi.mock('@/lib/billing.ts', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/lib/billing.ts')>()),
    get BILLING_LIVE() {
        return billingLive
    },
}))
vi.mock('@/components/auth/AuthContext.tsx', () => ({
    useAuth: () => ({ user: signedIn ? { id: 'u1' } : null, isLoading: false }),
}))
vi.mock('@/hooks/billing/useBillingStatusQuery.ts', () => ({
    default: ({ enabled }: { enabled?: boolean } = {}) => ({
        data: enabled
            ? {
                  hasPass: coveredTests.length > 0,
                  coveredTests,
                  seasons: seasonsOnSale
                      ? [
                            {
                                key: 'oct-2026',
                                label: 'October 2026',
                                lastDay: '2026-10-16',
                                priceAmount: 9900,
                                priceCurrency: 'MYR',
                                alreadyCovered: false,
                            },
                        ]
                      : [],
              }
            : undefined,
    }),
}))
vi.mock('@/hooks/diagnostic/useListPublishedSetsQuery.ts', () => ({
    default: () => mockSets(),
}))
vi.mock('@/components/layout/landing/LandingLayout.tsx', () => ({
    LandingLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
vi.mock('react-router-dom', async () => {
    const actual =
        await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
    return { ...actual, useNavigate: () => mockNavigate }
})

function s(id: string, title: string, subject: string): PublishedDiagnosticSet {
    return {
        id, title, subject, description: null,
        timeLimitMinutes: 40, questionCount: 27, isFree: true,
    }
}

function renderPage() {
    return render(
        <MemoryRouter>
            <DiagnosticsCatalogPage />
        </MemoryRouter>
    )
}

describe('DiagnosticsCatalogPage', () => {
    beforeEach(() => {
        mockSets.mockReset()
        mockNavigate.mockReset()
        billingLive = false
        coveredTests = []
        signedIn = false
        seasonsOnSale = true
    })

    it('lists published sets grouped by subject with question count + time', () => {
        mockSets.mockReturnValue({
            data: [
                s('p1', 'Physics Set A', 'ESAT Physics'),
                s('m1', 'Maths 1 Set A', 'ESAT Maths 1'),
                s('p2', 'Physics Set B', 'ESAT Physics'),
            ],
            isLoading: false,
        })
        renderPage()
        // Subject headings present, physics grouped together.
        expect(screen.getByText('ESAT Physics')).toBeInTheDocument()
        expect(screen.getByText('ESAT Maths 1')).toBeInTheDocument()
        const physics = screen.getByText('ESAT Physics').closest('section')!
        expect(within(physics).getByText('Physics Set A')).toBeInTheDocument()
        expect(within(physics).getByText('Physics Set B')).toBeInTheDocument()
        expect(screen.getAllByText(/27 questions · 40 min/)[0]).toBeInTheDocument()
    })

    it('starts a diagnostic by routing to its start screen', () => {
        mockSets.mockReturnValue({
            data: [s('p1', 'Physics Set A', 'ESAT Physics')],
            isLoading: false,
        })
        renderPage()
        fireEvent.click(screen.getByRole('button', { name: /Start diagnostic/i }))
        expect(mockNavigate).toHaveBeenCalledWith('/diagnostic/sets/p1')
    })

    it('shows an empty state when nothing is published', () => {
        mockSets.mockReturnValue({ data: [], isLoading: false })
        renderPage()
        expect(screen.getByText(/No diagnostics are available/i)).toBeInTheDocument()
    })
})

/** A paid set from the other test, to prove a pass does not leak across. */
function paidTmuaSet() {
    return {
        ...paidSet(),
        id: 'set-tmua-paid',
        title: 'TMUA Paper 1 — Diagnostic Set B',
        subject: 'TMUA Paper 1',
    }
}

/** A paid set — the only kind whose CTA depends on billing state. */
function paidSet() {
    return {
        id: 'set-paid',
        title: 'ESAT Biology — Diagnostic Set B',
        subject: 'ESAT Biology',
        description: null,
        timeLimitMinutes: 40,
        questionCount: 27,
        isFree: false,
    }
}

describe('the CTA on a paid set', () => {
    beforeEach(() => {
        mockSets.mockReset()
        mockNavigate.mockReset()
        billingLive = false
        coveredTests = []
        signedIn = false
        seasonsOnSale = true
        mockSets.mockReturnValue({ data: [paidSet()], isLoading: false })
    })

    it('shows a disabled coming-soon button before billing is live', () => {
        renderPage()
        expect(screen.getByRole('button', { name: /coming soon/i })).toBeDisabled()
        expect(
            screen.queryByRole('button', { name: /Unlock with Season Pass/i })
        ).not.toBeInTheDocument()
    })

    it('routes to the start screen rather than buying from the grid', () => {
        // Two sittings, each with its own price and end date, do not fit
        // honestly in a grid card — so the catalogue never runs checkout. The
        // start screen has room for the choice, and shows samples besides.
        billingLive = true
        signedIn = true
        renderPage()
        fireEvent.click(
            screen.getByRole('button', { name: /Unlock with Season Pass/i })
        )
        expect(mockNavigate).toHaveBeenCalledWith('/diagnostic/sets/set-paid')
    })

    it('never offers to sell to someone who already holds a pass', () => {
        // The trap the old two-branch CTA fell into: it keyed off billing
        // being live and nothing else, so a pass holder was invited to buy
        // again.
        billingLive = true
        signedIn = true
        coveredTests = ['esat']
        renderPage()
        expect(
            screen.queryByRole('button', { name: /Unlock with Season Pass/i })
        ).not.toBeInTheDocument()
        fireEvent.click(
            screen.getByRole('button', { name: /Start diagnostic/i })
        )
        expect(mockNavigate).toHaveBeenCalledWith('/diagnostic/sets/set-paid')
    })

    it('does not let an ESAT pass unlock a paid TMUA paper', () => {
        // Found by walking the real flow: buying ESAT made every paid TMUA
        // card read "Start diagnostic". The attempt itself was still refused
        // with a 402, so nothing was given away — but the card promised
        // something the server would not honour, and the student found out by
        // clicking it.
        billingLive = true
        signedIn = true
        coveredTests = ['esat']
        mockSets.mockReturnValue({ data: [paidTmuaSet()], isLoading: false })
        renderPage()
        expect(
            screen.getByRole('button', { name: /Unlock with Season Pass/i })
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /Start diagnostic/i })
        ).not.toBeInTheDocument()
    })

    it('unlocks a paid TMUA paper for someone holding the TMUA pass', () => {
        // The other direction, so the test above is proving scoping rather
        // than just that TMUA is always locked.
        billingLive = true
        signedIn = true
        coveredTests = ['tmua']
        mockSets.mockReturnValue({ data: [paidTmuaSet()], isLoading: false })
        renderPage()
        expect(
            screen.getByRole('button', { name: /Start diagnostic/i })
        ).toBeInTheDocument()
    })

    it('unlocks both for a comped pass', () => {
        // Comps predate the split and carry no test, so they arrive as every
        // test there is.
        billingLive = true
        signedIn = true
        coveredTests = ['esat', 'tmua']
        mockSets.mockReturnValue({ data: [paidTmuaSet()], isLoading: false })
        renderPage()
        expect(
            screen.getByRole('button', { name: /Start diagnostic/i })
        ).toBeInTheDocument()
    })

    it('sends a signed-out visitor to the start screen too', () => {
        // Checkout needs an account to attach the pass to, and the start
        // screen is where the sign-in wall lives.
        billingLive = true
        renderPage()
        fireEvent.click(
            screen.getByRole('button', { name: /Unlock with Season Pass/i })
        )
        expect(mockNavigate).toHaveBeenCalledWith('/diagnostic/sets/set-paid')
    })

    it('stops offering an unlock once every sitting has passed', () => {
        // The backend refuses with a 409 — a grant made then would carry an
        // expiry already in the past, so the student would pay for nothing.
        billingLive = true
        signedIn = true
        seasonsOnSale = false
        renderPage()
        expect(screen.getByRole('button', { name: /coming soon/i })).toBeDisabled()
    })

    it('still lets an existing pass holder start after the seasons end', () => {
        // Their pass is dated too, so the server settles whether it still
        // works. What must not happen is the catalogue hiding a paper from
        // someone who paid for it.
        billingLive = true
        signedIn = true
        coveredTests = ['esat']
        seasonsOnSale = false
        renderPage()
        expect(
            screen.getByRole('button', { name: /Start diagnostic/i })
        ).toBeInTheDocument()
    })

    it('does not ask about a pass when the answer cannot change the CTA', () => {
        // A public page most visitors reach without an account: with billing
        // off, or signed out, every paid card renders the same either way.
        billingLive = false
        signedIn = true
        renderPage()
        expect(screen.getByRole('button', { name: /coming soon/i })).toBeDisabled()
    })
})
