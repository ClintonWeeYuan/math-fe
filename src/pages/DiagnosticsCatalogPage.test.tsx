import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DiagnosticsCatalogPage } from './DiagnosticsCatalogPage'
import type { PublishedDiagnosticSet } from '@/client'
import type { StudentAttempt } from '@/lib/myResults.ts'
import type { EsatModule } from '@/lib/esatModules.ts'

const mockSets = vi.fn()
const mockNavigate = vi.fn()
const mockChoose = vi.fn()

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
/** The student's own attempts. */
let attempts: StudentAttempt[] = []
/** The ESAT modules they have chosen; null until they choose. */
let esatModules: EsatModule[] | null = null

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
                                key: 'esat_2026_27',
                                test: 'esat',
                                label: 'ESAT Season Pass',
                                lastDay: '2027-01-31',
                                priceAmount: 5900,
                                priceCurrency: 'GBP',
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
vi.mock('@/hooks/diagnostic/useMyAttemptsQuery.ts', () => ({
    default: ({ enabled }: { enabled?: boolean } = {}) => ({
        data: enabled ? attempts : undefined,
    }),
}))
vi.mock('@/hooks/diagnostic/useEsatModules.ts', () => ({
    default: () => ({ modules: esatModules, isLoading: false, choose: mockChoose }),
}))
vi.mock('@/components/layout/landing/LandingLayout.tsx', () => ({
    LandingLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
vi.mock('react-router-dom', async () => {
    const actual =
        await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
    return { ...actual, useNavigate: () => mockNavigate }
})

const SUBJECTS = {
    maths_1: 'ESAT Math 1',
    maths_2: 'ESAT Math 2',
    physics: 'ESAT Physics',
    chemistry: 'ESAT Chemistry',
    biology: 'ESAT Biology',
}

function full(
    subject: string,
    letter: string,
    over: Partial<PublishedDiagnosticSet> = {}
): PublishedDiagnosticSet {
    return {
        id: `${subject}-${letter}`,
        title: `${subject} — Diagnostic Set ${letter}`,
        subject,
        description: null,
        timeLimitMinutes: 40,
        questionCount: 27,
        isFree: letter === 'A',
        ...over,
    }
}

function mini(subject: string, timeLimitMinutes = 15, questionCount = 10) {
    return {
        id: `${subject}-mini`,
        title: `${subject} — Mini Test`,
        subject,
        description: null,
        timeLimitMinutes,
        questionCount,
        isFree: true,
        format: 'mini',
    } as PublishedDiagnosticSet
}

/** Every ESAT module with a Mini, a free Set A and a paid Set B. */
function esatCatalogue(): PublishedDiagnosticSet[] {
    return Object.values(SUBJECTS).flatMap((subject) => [
        mini(subject),
        full(subject, 'A'),
        full(subject, 'B'),
    ])
}

function attempt(set: PublishedDiagnosticSet, over: Partial<StudentAttempt> = {}): StudentAttempt {
    return {
        attemptId: `att-${set.id}`,
        setId: set.id,
        setTitle: set.title,
        subject: set.subject,
        status: 'submitted',
        totalScore: 20,
        answeredCount: 27,
        questionCount: 27,
        startedAt: '2026-09-30T10:00:00Z',
        ...over,
    }
}

function renderPage(test?: 'esat' | 'tmua') {
    return render(
        <MemoryRouter>
            <DiagnosticsCatalogPage test={test} />
        </MemoryRouter>
    )
}

function module(name: string) {
    return screen.getByRole('heading', { name }).closest('section')!
}

beforeEach(() => {
    mockSets.mockReset()
    mockNavigate.mockReset()
    mockChoose.mockReset()
    billingLive = false
    coveredTests = []
    signedIn = false
    seasonsOnSale = true
    attempts = []
    esatModules = null
})

describe('the module blocks', () => {
    it('groups sets by module and gives the paper length once', () => {
        mockSets.mockReturnValue({ data: esatCatalogue(), isLoading: false })
        renderPage()
        const physics = module('Physics')
        expect(within(physics).getByText(/Full paper: 27 questions · 40 min/)).toBeInTheDocument()
        expect(within(physics).getByRole('button', { name: /Physics — Diagnostic Set B/ })).toBeInTheDocument()
    })

    it('puts Maths 1 first rather than alphabetical Biology', () => {
        mockSets.mockReturnValue({ data: esatCatalogue(), isLoading: false })
        renderPage()
        const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
        expect(headings).toEqual(['Maths 1', 'Maths 2', 'Physics', 'Chemistry', 'Biology'])
    })

    it('opens a paper by routing to its start screen', () => {
        mockSets.mockReturnValue({ data: esatCatalogue(), isLoading: false })
        renderPage()
        fireEvent.click(
            within(module('Physics')).getAllByRole('button', { name: /Physics — Diagnostic Set A: start/ })[0]
        )
        expect(mockNavigate).toHaveBeenCalledWith('/diagnostic/sets/ESAT Physics-A')
    })

    it('shows an empty state when nothing is published', () => {
        mockSets.mockReturnValue({ data: [], isLoading: false })
        renderPage()
        expect(screen.getByText(/No diagnostics are available/i)).toBeInTheDocument()
    })

    it("states a mini's length on its own card, since it differs by test", () => {
        mockSets.mockReturnValue({
            data: [mini('TMUA Paper 1', 19, 5), full('TMUA Paper 1', 'A', { timeLimitMinutes: 75, questionCount: 20 })],
            isLoading: false,
        })
        renderPage('tmua')
        expect(screen.getByText(/5 questions · 19 min · free/)).toBeInTheDocument()
        expect(screen.getByText(/Full paper: 20 questions · 75 min/)).toBeInTheDocument()
    })
})

describe('scores on the tiles', () => {
    it('shows the best score on a paper the student has sat', () => {
        signedIn = true
        const sets = esatCatalogue()
        attempts = [attempt(sets.find((s) => s.id === 'ESAT Physics-A')!, { totalScore: 20 })]
        mockSets.mockReturnValue({ data: sets, isLoading: false })
        renderPage()
        expect(
            within(module('Physics')).getAllByRole('button', { name: /Physics — Diagnostic Set A: done, 74%/ })[0]
        ).toBeInTheDocument()
    })

    it('offers to resume a paper still in progress', () => {
        signedIn = true
        const sets = esatCatalogue()
        attempts = [
            attempt(sets.find((s) => s.id === 'ESAT Physics-A')!, {
                status: 'in_progress', totalScore: null, answeredCount: 4,
            }),
        ]
        mockSets.mockReturnValue({ data: sets, isLoading: false })
        renderPage()
        expect(
            within(module('Physics')).getAllByRole('button', { name: /Physics — Diagnostic Set A: in progress/ })[0]
        ).toBeInTheDocument()
    })

    it('asks for no attempts from a signed-out visitor', () => {
        attempts = [attempt(full('ESAT Physics', 'A'))]
        mockSets.mockReturnValue({ data: esatCatalogue(), isLoading: false })
        renderPage()
        expect(screen.queryByText('74%')).not.toBeInTheDocument()
    })
})

describe('choosing ESAT modules', () => {
    beforeEach(() => {
        mockSets.mockReturnValue({ data: esatCatalogue(), isLoading: false })
    })

    it('asks before showing any papers', () => {
        renderPage('esat')
        expect(screen.getByRole('heading', { name: /Which modules are you sitting/ })).toBeInTheDocument()
        expect(screen.queryByRole('heading', { name: 'Biology' })).not.toBeInTheDocument()
    })

    it('always includes Maths 1 and needs at least one more', () => {
        renderPage('esat')
        expect(screen.getByRole('checkbox', { name: /Maths 1/ })).toHaveAttribute('aria-checked', 'true')
        fireEvent.click(screen.getByRole('checkbox', { name: /Maths 1/ }))
        expect(screen.getByRole('checkbox', { name: /Maths 1/ })).toHaveAttribute('aria-checked', 'true')
        expect(screen.getByRole('button', { name: /Show my papers/ })).toBeDisabled()

        fireEvent.click(screen.getByRole('checkbox', { name: /Maths 2/ }))
        expect(screen.getByRole('button', { name: /Show my papers/ })).toBeEnabled()
    })

    it('saves Maths 1 and the two picked', () => {
        renderPage('esat')
        fireEvent.click(screen.getByRole('checkbox', { name: /Maths 2/ }))
        fireEvent.click(screen.getByRole('checkbox', { name: /Physics/ }))
        fireEvent.click(screen.getByRole('button', { name: /Show my papers/ }))
        expect(mockChoose).toHaveBeenCalledWith(['maths_1', 'maths_2', 'physics'])
    })

    it('swaps out the oldest pick rather than allowing a fourth module', () => {
        renderPage('esat')
        fireEvent.click(screen.getByRole('checkbox', { name: /Maths 2/ }))
        fireEvent.click(screen.getByRole('checkbox', { name: /Physics/ }))
        fireEvent.click(screen.getByRole('checkbox', { name: /Chemistry/ }))
        expect(screen.getByRole('checkbox', { name: /Maths 2/ })).toHaveAttribute('aria-checked', 'false')
        fireEvent.click(screen.getByRole('button', { name: /Show my papers/ }))
        expect(mockChoose).toHaveBeenCalledWith(['maths_1', 'physics', 'chemistry'])
    })

    it('shows only the chosen modules once chosen', () => {
        esatModules = ['maths_1', 'chemistry', 'biology']
        renderPage('esat')
        const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
        expect(headings).toEqual(['Maths 1', 'Chemistry', 'Biology'])
    })

    it('lets them change their modules, starting from the current choice', () => {
        esatModules = ['maths_1', 'chemistry', 'biology']
        renderPage('esat')
        fireEvent.click(screen.getByRole('button', { name: 'Change' }))
        expect(screen.getByRole('checkbox', { name: /Chemistry/ })).toHaveAttribute('aria-checked', 'true')
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
        expect(screen.getByRole('heading', { name: 'Chemistry' })).toBeInTheDocument()
    })

    it('can show all five modules for someone who has not decided', () => {
        renderPage('esat')
        fireEvent.click(screen.getByRole('button', { name: /Show all five modules/ }))
        expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(5)
        expect(mockChoose).not.toHaveBeenCalled()
    })

    it('never asks on the TMUA page, where everyone sits both papers', () => {
        mockSets.mockReturnValue({
            data: [full('TMUA Paper 1', 'A'), full('TMUA Paper 2', 'A')],
            isLoading: false,
        })
        renderPage('tmua')
        expect(screen.queryByText(/Which modules are you sitting/)).not.toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Paper 1' })).toBeInTheDocument()
    })
})

describe('the Season Pass', () => {
    const paidTmua = () => full('TMUA Paper 1', 'B')

    beforeEach(() => {
        mockSets.mockReturnValue({ data: esatCatalogue(), isLoading: false })
    })

    it('is mentioned once, not on every locked paper', () => {
        billingLive = true
        renderPage()
        expect(screen.getAllByRole('button', { name: /Unlock · £59/ })).toHaveLength(1)
    })

    it('shows a disabled coming-soon button before billing is live', () => {
        renderPage()
        expect(screen.getByRole('button', { name: /coming soon/i })).toBeDisabled()
        expect(screen.queryByRole('button', { name: /Unlock/ })).not.toBeInTheDocument()
    })

    it('routes to a paid paper\'s start screen rather than buying from the list', () => {
        billingLive = true
        signedIn = true
        renderPage()
        fireEvent.click(screen.getByRole('button', { name: /Unlock · £59/ }))
        expect(mockNavigate).toHaveBeenCalledWith('/diagnostic/sets/ESAT Math 1-B')
    })

    it('never offers to sell to someone who already holds a pass', () => {
        billingLive = true
        signedIn = true
        coveredTests = ['esat']
        renderPage()
        expect(screen.queryByRole('button', { name: /Unlock/ })).not.toBeInTheDocument()
        expect(
            within(module('Physics')).getByRole('button', { name: /Physics — Diagnostic Set B: start/ })
        ).toBeInTheDocument()
    })

    it('does not let an ESAT pass unlock a paid TMUA paper', () => {
        billingLive = true
        signedIn = true
        coveredTests = ['esat']
        mockSets.mockReturnValue({ data: [paidTmua()], isLoading: false })
        renderPage()
        expect(screen.getByRole('button', { name: /TMUA Paper 1 — Diagnostic Set B: Season Pass/ })).toBeInTheDocument()
    })

    it('unlocks a paid TMUA paper for someone holding the TMUA pass', () => {
        billingLive = true
        signedIn = true
        coveredTests = ['tmua']
        mockSets.mockReturnValue({ data: [paidTmua()], isLoading: false })
        renderPage()
        expect(screen.getByRole('button', { name: /TMUA Paper 1 — Diagnostic Set B: start/ })).toBeInTheDocument()
    })

    it('stops offering an unlock once every sitting has passed', () => {
        billingLive = true
        signedIn = true
        seasonsOnSale = false
        renderPage()
        expect(screen.getByRole('button', { name: /coming soon/i })).toBeDisabled()
    })

    it('still lets an existing pass holder start after the seasons end', () => {
        billingLive = true
        signedIn = true
        coveredTests = ['esat']
        seasonsOnSale = false
        renderPage()
        expect(
            within(module('Physics')).getByRole('button', { name: /Physics — Diagnostic Set B: start/ })
        ).toBeInTheDocument()
    })
})
