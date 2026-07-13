import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { PacingCurve } from './PacingCurve'
import type { PerQuestionTime } from '@/client'

function t(questionOrderIndex: number, totalTimeSeconds: number, viewCount = 1): PerQuestionTime {
    return { questionId: `q${questionOrderIndex}`, questionOrderIndex, totalTimeSeconds, viewCount }
}

describe('PacingCurve', () => {
    it('distinguishes never-reached from a viewed-briefly question in the table', () => {
        // Q1 viewed 0s (briefly), Q2 viewed, Q3 never reached (set size 3).
        render(<PacingCurve perQuestionTime={[t(0, 0), t(1, 20)]} questionCount={3} />)
        const table = screen.getByRole('table', { name: /time per question/i })

        const q1 = within(table).getByRole('rowheader', { name: 'Question 1' }).closest('tr')!
        // viewed-briefly reads its real 0:00 — a data point, not absence.
        expect(within(q1).getAllByRole('cell')[0]).toHaveTextContent('0:00')

        const q3 = within(table).getByRole('rowheader', { name: 'Question 3' }).closest('tr')!
        // never-reached reads "Not reached", NOT 0:00 — the fabricated-zero
        // this guards against.
        expect(within(q3).getAllByRole('cell')[0]).toHaveTextContent('Not reached')
        expect(within(q3).getAllByRole('cell')[0]).not.toHaveTextContent('0:00')
    })

    it('draws a filled dot per reached question and a hollow marker per never-reached', () => {
        const { container } = render(
            <PacingCurve perQuestionTime={[t(0, 30), t(2, 15)]} questionCount={4} />
        )
        // 2 reached -> 2 filled dots; 2 never-reached -> 2 hollow markers.
        expect(container.querySelectorAll('circle.fill-emerald-500')).toHaveLength(2)
        expect(container.querySelectorAll('circle.fill-none')).toHaveLength(2)
    })

    it('breaks the line at a never-reached question — no segment spans the gap', () => {
        // Q1, Q2 reached & adjacent -> one segment; Q3 never reached; Q4
        // reached but isolated -> no further segment.
        const { container } = render(
            <PacingCurve perQuestionTime={[t(0, 30), t(1, 20), t(3, 10)]} questionCount={4} />
        )
        expect(container.querySelectorAll('line.stroke-emerald-500')).toHaveLength(1)
    })

    it('tags revisited questions with ×N (viewCount as a discrete mark, not height)', () => {
        const { container } = render(
            <PacingCurve perQuestionTime={[t(0, 10, 3), t(1, 60, 1)]} questionCount={2} />
        )
        // Q1 visited 3× -> "×3" tag; Q2 once -> no tag.
        const tags = [...container.querySelectorAll('text')].map((n) => n.textContent)
        expect(tags).toContain('×3')
        expect(tags).not.toContain('×1')
    })

    it('reflects the median "typical pace" reference in the SVG', () => {
        const { container } = render(
            <PacingCurve perQuestionTime={[t(0, 10), t(1, 20), t(2, 30)]} questionCount={3} />
        )
        expect(container.querySelector('text')?.ownerSVGElement).toBeTruthy()
        expect([...container.querySelectorAll('text')].map((n) => n.textContent)).toContain(
            'typical pace'
        )
    })

    it('hides the decorative SVG from assistive tech', () => {
        const { container } = render(
            <PacingCurve perQuestionTime={[t(0, 10)]} questionCount={1} />
        )
        expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    })
})
