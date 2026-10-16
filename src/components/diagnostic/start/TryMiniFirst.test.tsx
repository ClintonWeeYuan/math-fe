import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TryMiniFirst } from './TryMiniFirst'

let sets: unknown[] = []
let attempts: unknown[] | undefined = []
vi.mock('@/hooks/diagnostic/useListPublishedSetsQuery.ts', () => ({
    default: () => ({ data: sets }),
}))
vi.mock('@/hooks/diagnostic/useMyAttemptsQuery.ts', () => ({
    default: ({ enabled }: { enabled?: boolean } = {}) => ({
        data: enabled ? attempts : undefined,
        isLoading: false,
    }),
}))

const tmuaMini = {
    id: 'p1-mini',
    title: 'TMUA Paper 1 — Mini Test',
    subject: 'TMUA Paper 1',
    format: 'mini',
    questionCount: 5,
    timeLimitMinutes: 19,
    isFree: true,
}

const show = (subject = 'TMUA Paper 1', signedIn = true) =>
    render(
        <MemoryRouter>
            <TryMiniFirst subject={subject} fullMinutes={75} signedIn={signedIn} />
        </MemoryRouter>
    )

beforeEach(() => {
    sets = [tmuaMini]
    attempts = []
})

describe('TryMiniFirst', () => {
    it('offers the mini to a newcomer on a TMUA full paper', () => {
        show()
        expect(screen.getByText(/First time on TMUA Paper 1\? This paper is 75 minutes/)).toBeInTheDocument()
        expect(screen.getByText(/5 questions in 19 minutes/)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Try the mini first →' })).toHaveAttribute(
            'href',
            '/diagnostic/sets/p1-mini'
        )
    })

    it('offers it to a signed-out visitor too', () => {
        show('TMUA Paper 1', false)
        expect(screen.getByRole('link', { name: 'Try the mini first →' })).toBeInTheDocument()
    })

    it('says nothing once the student has started anything in that paper', () => {
        attempts = [{ subject: 'TMUA Paper 1' }]
        const { container } = show()
        expect(container).toBeEmptyDOMElement()
    })

    it('says nothing on ESAT, which keeps Mini and Set A side by side', () => {
        sets = [{ ...tmuaMini, id: 'm1-mini', subject: 'ESAT Math 1' }]
        const { container } = show('ESAT Math 1')
        expect(container).toBeEmptyDOMElement()
    })
})
