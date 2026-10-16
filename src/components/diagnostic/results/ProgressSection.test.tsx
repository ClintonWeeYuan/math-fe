import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressSection } from './ProgressSection'

const point = (setTitle: string, pct: number, day: number) => ({
    attemptId: `${setTitle}-${day}`,
    setTitle,
    pct,
    submittedAt: `2026-10-${String(day).padStart(2, '0')}T10:00:00Z`,
})

describe('ProgressSection', () => {
    it('shows each tracked module’s scores in order and the change since the first', () => {
        render(
            <ProgressSection
                progress={[
                    {
                        subject: 'ESAT Physics',
                        points: [
                            point('ESAT Physics — Diagnostic Set A', 48, 1),
                            point('ESAT Physics — Diagnostic Set B', 67, 5),
                        ],
                        change: 19,
                    },
                ]}
            />
        )
        expect(screen.getByText('Up 19 points since your first paper')).toBeInTheDocument()
        const list = screen.getByRole('list', { name: 'Physics scores in order' })
        expect(list).toHaveTextContent('48%Set A67%Set B')
    })

    it('invites a second paper where there is only one', () => {
        render(
            <ProgressSection
                progress={[
                    { subject: 'ESAT Math 1', points: [point('ESAT Math 1 — Diagnostic Set A', 70, 1)], change: null },
                ]}
            />
        )
        expect(
            screen.getByText(/Sit a second full paper in Math 1 and you'll see how your score moves/)
        ).toBeInTheDocument()
    })

    it('renders nothing before any full paper', () => {
        const { container } = render(<ProgressSection progress={[]} />)
        expect(container).toBeEmptyDOMElement()
    })
})
