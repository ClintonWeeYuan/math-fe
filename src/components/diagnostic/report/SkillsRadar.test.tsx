import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { SkillsRadar } from './SkillsRadar'
import type { SkillScore } from '@/client'

function skills(scores: Array<number | null>): SkillScore[] {
    return scores.map((score, i) => ({
        skill: `S${i + 1}`,
        score,
        attempted: score === null ? 0 : 3,
        correct: score === null ? 0 : Math.round(score * 3),
    }))
}

describe('SkillsRadar', () => {
    it('legend keeps not-measured distinct from a real 0%', () => {
        // S1 scored, S2 assessed-0, S3 not measured.
        render(<SkillsRadar skills={skills([2 / 3, 0, null, null, null, null, null])} />)
        const table = screen.getByRole('table')
        // 7 skill rows, no column-header row.
        expect(within(table).getAllByRole('row')).toHaveLength(7)

        const s3 = within(table).getByRole('rowheader', { name: 'S3' }).closest('tr')!
        expect(within(s3).getByRole('cell')).toHaveTextContent('not assessed in this set')
        expect(within(s3).getByRole('cell')).not.toHaveTextContent('0%')

        const s2 = within(table).getByRole('rowheader', { name: 'S2' }).closest('tr')!
        expect(within(s2).getByRole('cell')).toHaveTextContent('0%')
        expect(within(s2).getByRole('cell')).not.toHaveTextContent('not assessed')
    })

    it('shows the percentage with its denominator', () => {
        render(
            <SkillsRadar skills={[{ skill: 'S1', score: 0.25, attempted: 4, correct: 1 }]} />
        )
        const row = screen.getByRole('rowheader', { name: 'S1' }).closest('tr')!
        expect(within(row).getByRole('cell')).toHaveTextContent('25%')
        expect(within(row).getByRole('cell')).toHaveTextContent('(1/4)')
    })

    it('decodes codes into full subject names when a subject is given', () => {
        render(
            <SkillsRadar
                subject="ESAT Physics"
                skills={[{ skill: 'S3', score: 0.5, attempted: 2, correct: 1 }]}
            />
        )
        // Physics S3 = Proportional & Ratio Reasoning (not the Maths meaning).
        expect(
            screen.getByRole('rowheader', { name: /Proportional & Ratio Reasoning/ })
        ).toBeInTheDocument()
    })

    it('draws a data dot only on assessed axes — never on a null one', () => {
        const { container } = render(
            <SkillsRadar skills={skills([0.5, null, 0.5, null, 0.5, null, 0.5])} />
        )
        expect(container.querySelectorAll('circle')).toHaveLength(4)
    })

    it('plots an assessed 0 as a dot (kept, not dropped like null)', () => {
        const { container } = render(
            <SkillsRadar skills={skills([0, null, null, null, null, null, null])} />
        )
        expect(container.querySelectorAll('circle')).toHaveLength(1)
    })

    it('draws no connecting edge that spans a null axis', () => {
        const { container } = render(
            <SkillsRadar skills={skills([0.5, null, 0.5, null, null, 0.5, null])} />
        )
        expect(container.querySelectorAll('line.stroke-emerald-500')).toHaveLength(0)
    })

    it('connects adjacent assessed axes with an emerald outline', () => {
        const { container } = render(
            <SkillsRadar skills={skills([0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5])} />
        )
        expect(container.querySelectorAll('line.stroke-emerald-500')).toHaveLength(7)
    })

    it('hides the decorative SVG from assistive tech', () => {
        const { container } = render(
            <SkillsRadar skills={skills([0.5, null, null, null, null, null, null])} />
        )
        expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    })
})
