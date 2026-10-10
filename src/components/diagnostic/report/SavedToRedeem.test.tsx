import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SavedToRedeem } from './SavedToRedeem'

/**
 * The "Saved to redeem" card on a full paper's report. It must say what was
 * kept and when it unlocks, and it must never claim "nothing to redeem"
 * unless the paper was actually perfect.
 */

const queued = {
    count: 3,
    wrongCount: 2,
    blankCount: 0,
    slowCount: 1,
    availableFrom: '2026-10-17T12:00:00Z',
    items: [
        { questionId: 'a', questionOrderIndex: 2, reason: 'wrong' as const, originalSeconds: 80 },
        { questionId: 'b', questionOrderIndex: 6, reason: 'wrong' as const, originalSeconds: 95 },
        { questionId: 'c', questionOrderIndex: 13, reason: 'slow' as const, originalSeconds: 250 },
    ],
}

const show = (props: Parameters<typeof SavedToRedeem>[0]) =>
    render(
        <MemoryRouter>
            <SavedToRedeem {...props} />
        </MemoryRouter>
    )

describe('SavedToRedeem', () => {
    it('says what was kept, when it unlocks, and which questions', () => {
        show({ queued, allRight: false })

        expect(screen.getByText('Saved to redeem')).toBeInTheDocument()
        expect(
            screen.getByText(
                "We've kept 3 questions from this paper for you to try again: 2 you got wrong and 1 that took a while."
            )
        ).toBeInTheDocument()
        expect(screen.getByText('Saturday 17 October')).toBeInTheDocument()
        expect(screen.getByText('Q3 · wrong')).toBeInTheDocument()
        expect(screen.getByText('Q14 · 4 min 10 s')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'See all my redemption questions →' })
        ).toBeInTheDocument()
    })

    it('praises a perfect paper', () => {
        show({ queued: { ...queued, count: 0, items: [] }, allRight: true })
        expect(screen.getByText(/Nothing to redeem from this paper/)).toBeInTheDocument()
    })

    it('renders nothing when nothing was queued for any other reason', () => {
        // An old report, or questions already in flight from another paper:
        // "nothing to redeem" would be a claim the card cannot back.
        const { container } = show({ queued: null, allRight: false })
        expect(container).toBeEmptyDOMElement()
    })
})
