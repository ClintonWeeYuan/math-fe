import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { WhatNext } from './WhatNext'
import type { PublishedDiagnosticSet } from '@/client'

const mockSets = vi.fn()
vi.mock('@/hooks/diagnostic/useListPublishedSetsQuery.ts', () => ({
    default: (...args: unknown[]) => ({ data: mockSets(...args) }),
}))
const mockAttempts = vi.fn()
vi.mock('@/hooks/diagnostic/useMyAttemptsQuery.ts', () => ({
    default: () => ({ data: mockAttempts() }),
}))

let n = 0
const set = (over: Partial<PublishedDiagnosticSet> = {}) =>
    ({
        id: `set-${++n}`,
        title: 'A paper',
        subject: 'ESAT Physics',
        description: null,
        timeLimitMinutes: 40,
        questionCount: 27,
        isFree: true,
        ...over,
    }) as PublishedDiagnosticSet

const show = (props: Partial<Parameters<typeof WhatNext>[0]> = {}) =>
    render(
        <MemoryRouter>
            <WhatNext
                subject="ESAT Math 1"
                currentSetId="current"
                isMini={false}
                {...props}
            />
        </MemoryRouter>
    )

beforeEach(() => {
    // Undefined = the attempt list has not loaded. That is the fail-open path
    // and the behaviour every test below assumed before this block knew about
    // history at all.
    mockAttempts.mockReturnValue(undefined)
})

describe('what to do next, at the foot of a report', () => {
    it('renders nothing rather than an empty heading when there is nothing to offer', () => {
        mockSets.mockReturnValue([])
        const { container } = show()
        expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing for a subject that belongs to no admissions test', () => {
        mockSets.mockReturnValue([set({ subject: 'ESAT Physics' })])
        const { container } = show({ subject: 'SPM Add Maths' })
        expect(container).toBeEmptyDOMElement()
    })

    it('names the other modules without repeating the test on every card', () => {
        mockSets.mockReturnValue([
            set({ subject: 'ESAT Physics' }),
            set({ subject: 'ESAT Biology' }),
        ])
        show()

        expect(screen.getByText('Physics')).toBeInTheDocument()
        expect(screen.getByText('Biology')).toBeInTheDocument()
        expect(screen.queryByText('ESAT Physics')).not.toBeInTheDocument()
    })

    it('asks only the catalogue for the test the student is sitting', () => {
        mockSets.mockReturnValue([])
        show({ subject: 'TMUA Paper 1' })
        expect(mockSets).toHaveBeenCalledWith('tmua')
    })

    it('points a mini at the full paper before offering other modules', () => {
        mockSets.mockReturnValue([
            set({ subject: 'ESAT Math 1', title: 'Set A' }),
            set({ subject: 'ESAT Biology' }),
        ])
        show({ isMini: true })

        expect(
            screen.getByText(/full paper is what resolves every skill/i)
        ).toBeInTheDocument()
        expect(screen.getByText('Or start another module:')).toBeInTheDocument()
    })

    it('sends each card to that set, not to the catalogue', () => {
        mockSets.mockReturnValue([set({ id: 'physics-a' })])
        show()

        // The card's own button starts that set; the catalogue link is the
        // separate fallback below it.
        expect(
            screen.getByRole('link', { name: /See every ESAT diagnostic/i })
        ).toHaveAttribute('href', '/diagnostics/esat')
        expect(screen.getByRole('button', { name: /Start/ })).toBeInTheDocument()
    })

    it('offers the modules-by-course table for ESAT, where the choice depends on it', () => {
        mockSets.mockReturnValue([set({ subject: 'ESAT Physics' })])
        show()

        expect(
            screen.getByRole('link', { name: /modules-by-course table/i })
        ).toHaveAttribute('href', '/guides/esat-practice-tests#format')
    })

    it('does not offer that table on TMUA, which has no module choice', () => {
        mockSets.mockReturnValue([set({ subject: 'TMUA Paper 2' })])
        show({ subject: 'TMUA Paper 1' })

        expect(
            screen.queryByText(/modules-by-course table/i)
        ).not.toBeInTheDocument()
    })

    it('stops offering a module the student has already finished', () => {
        mockSets.mockReturnValue([
            set({ subject: 'ESAT Physics' }),
            set({ subject: 'ESAT Biology' }),
        ])
        mockAttempts.mockReturnValue([
            {
                attemptId: 'a1',
                setId: 'physics-set',
                subject: 'ESAT Physics',
                status: 'submitted',
                answeredCount: 27,
                questionCount: 27,
                startedAt: '2026-08-01T10:00:00Z',
            },
        ])
        show()

        expect(screen.queryByText('Physics')).not.toBeInTheDocument()
        expect(screen.getByText('Biology')).toBeInTheDocument()
    })

    it('still offers a module they only abandoned', () => {
        // An abandoned paper is not a subject you have covered, and hiding it
        // would bury the module they most need to go back to.
        mockSets.mockReturnValue([set({ subject: 'ESAT Physics' })])
        mockAttempts.mockReturnValue([
            {
                attemptId: 'a1',
                setId: 'physics-set',
                subject: 'ESAT Physics',
                status: 'in_progress',
                answeredCount: 3,
                questionCount: 27,
                startedAt: '2026-08-01T10:00:00Z',
            },
        ])
        show()

        expect(screen.getByText('Physics')).toBeInTheDocument()
    })
})
