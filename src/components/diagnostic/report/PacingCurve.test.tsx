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

    it('draws a bar per reached question and a baseline stub per never-reached', () => {
        const { container } = render(
            <PacingCurve perQuestionTime={[t(0, 30), t(2, 15)]} questionCount={4} />
        )
        // 2 reached -> 2 emerald bars; 2 never-reached -> 2 grey stubs.
        const rects = [...container.querySelectorAll('rect')]
        const bars = rects.filter((r) => r.getAttribute('class')?.includes('emerald'))
        const stubs = rects.filter((r) => r.getAttribute('class')?.includes('gray'))
        expect(bars).toHaveLength(2)
        expect(stubs).toHaveLength(2)
    })

    it('gives a never-reached question a flat stub, never a zero-height bar', () => {
        // The distinction the whole three-state model exists for: "never saw
        // it" must not render as "answered it instantly".
        const { container } = render(
            <PacingCurve perQuestionTime={[t(0, 30), t(1, 20), t(3, 10)]} questionCount={4} />
        )
        const stubs = [...container.querySelectorAll('rect')].filter((r) =>
            r.getAttribute('class')?.includes('gray')
        )
        expect(stubs).toHaveLength(1)
        expect(stubs[0].getAttribute('height')).toBe('2')
        expect(stubs[0].querySelector('title')?.textContent).toContain('not reached')
    })

    it('names and times the slowest question, so the peak is not left to be estimated', () => {
        const { container } = render(
            <PacingCurve perQuestionTime={[t(0, 30), t(1, 260), t(2, 10)]} questionCount={3} />
        )
        const labels = [...container.querySelectorAll('text')].map((n) => n.textContent)
        expect(labels).toContain('Q2 · 4:20')
    })

    it('puts the exact value on every bar for a mouse reader', () => {
        const { container } = render(
            <PacingCurve perQuestionTime={[t(0, 90, 2)]} questionCount={1} />
        )
        const title = container.querySelector('rect title')?.textContent
        expect(title).toContain('Q1')
        expect(title).toContain('1:30')
        expect(title).toContain('2 visits')
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
        // The dashed line is in the plot; its value is named in the legend
        // below, where no bar can sit on top of it. Both must be present —
        // the line without a number gives the chart no scale at all.
        expect(container.querySelector('line[stroke-dasharray]')).toBeTruthy()
        expect(container.textContent).toContain('Typical pace 0:20 per question')
        // And specifically NOT inside the SVG, which is where it used to
        // collide with a slow first question.
        const svgText = [...container.querySelectorAll('svg text')].map(
            (n) => n.textContent
        )
        expect(svgText.join(' ')).not.toContain('Typical')
    })

    it('hides the decorative SVG from assistive tech', () => {
        const { container } = render(
            <PacingCurve perQuestionTime={[t(0, 10)]} questionCount={1} />
        )
        expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    })
})
