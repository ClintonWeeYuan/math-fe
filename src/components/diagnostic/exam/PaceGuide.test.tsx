import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PaceGuide } from './PaceGuide'

const track = vi.fn()
vi.mock('@/lib/analytics.ts', () => ({
    trackEvent: (...args: unknown[]) => track(...args),
}))

const START = Date.now() - 600_000 // 10 minutes ago

function show(over: Partial<Parameters<typeof PaceGuide>[0]> = {}) {
    return render(
        <PaceGuide
            attemptId="att-1"
            startedAt={new Date(START).toISOString()}
            serverDeadlineAt={new Date(START + 40 * 60_000).toISOString()}
            isPaused={false}
            questionCount={27}
            answered={3}
            {...over}
        />
    )
}

beforeEach(() => {
    localStorage.clear()
    track.mockReset()
})

describe('PaceGuide', () => {
    it('is shown by default and says where the student stands', () => {
        show()
        expect(screen.getByRole('status')).toHaveTextContent('4 min behind')
        expect(screen.getByText(/3 of 27 answered · about 1 min 29 s a question/)).toBeInTheDocument()
    })

    it('hides on one tap, remembers it, and records the choice', async () => {
        const { unmount } = show()
        await userEvent.click(screen.getByRole('button', { name: 'Hide' }))
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
        expect(track).toHaveBeenCalledWith('pace_guide_toggled', {
            attemptId: 'att-1',
            metadata: { shown: false },
        })

        unmount()
        show()
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
        await userEvent.click(screen.getByRole('button', { name: 'Show pace guide' }))
        expect(screen.getByRole('status')).toBeInTheDocument()
        expect(track).toHaveBeenLastCalledWith('pace_guide_toggled', {
            attemptId: 'att-1',
            metadata: { shown: true },
        })
    })

    it('is not shown on a rest break, when the clock is stopped', () => {
        const { container } = show({ isPaused: true })
        expect(container).toBeEmptyDOMElement()
    })
})
