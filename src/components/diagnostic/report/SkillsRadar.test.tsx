import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { SkillsRadar } from './SkillsRadar'
import type { SkillScore } from '@/client'

function skills(scores: Array<number | null>): SkillScore[] {
    return scores.map((score, i) => ({ skill: `S${i + 1}`, score }))
}

describe('SkillsRadar', () => {
    it('exposes an accessible table that reflects null vs. real scores', () => {
        // S1=2/3, S2=0 (assessed), S3–S7 null.
        render(<SkillsRadar skills={skills([2 / 3, 0, null, null, null, null, null])} />)
        const table = screen.getByRole('table')
        const rows = within(table).getAllByRole('row')
        // header + 7 skill rows
        expect(rows).toHaveLength(8)

        const s1 = within(table).getByRole('rowheader', { name: 'S1' }).closest('tr')!
        expect(within(s1).getByRole('cell')).toHaveTextContent('67%')

        // The regression this whole thread guards against: a null skill must
        // read "Not assessed", NOT "0%".
        const s3 = within(table).getByRole('rowheader', { name: 'S3' }).closest('tr')!
        expect(within(s3).getByRole('cell')).toHaveTextContent('Not assessed')
        expect(within(s3).getByRole('cell')).not.toHaveTextContent('0%')

        // And an assessed 0 is a real "0%", distinct from "Not assessed".
        const s2 = within(table).getByRole('rowheader', { name: 'S2' }).closest('tr')!
        expect(within(s2).getByRole('cell')).toHaveTextContent('0%')
        expect(within(s2).getByRole('cell')).not.toHaveTextContent('Not assessed')
    })

    it('draws a data dot only on assessed axes — never on a null one', () => {
        const { container } = render(
            <SkillsRadar skills={skills([0.5, null, 0.5, null, 0.5, null, 0.5])} />
        )
        // 4 assessed -> 4 dots.
        expect(container.querySelectorAll('circle')).toHaveLength(4)
    })

    it('plots an assessed 0 as a dot (kept, not dropped like null)', () => {
        const { container } = render(
            <SkillsRadar skills={skills([0, null, null, null, null, null, null])} />
        )
        // The single assessed-0 skill still gets its dot.
        expect(container.querySelectorAll('circle')).toHaveLength(1)
    })

    it('draws no connecting edge that spans a null axis', () => {
        // Assessed at 0,2,5 — none adjacent -> zero connecting segments, so
        // no line can cross a null spoke. (Grid rings are <polygon>, spokes
        // and any outline are <line>; assert the emerald outline lines.)
        const { container } = render(
            <SkillsRadar skills={skills([0.5, null, 0.5, null, null, 0.5, null])} />
        )
        const outline = container.querySelectorAll('line.stroke-emerald-500')
        expect(outline).toHaveLength(0)
    })

    it('connects adjacent assessed axes with an emerald outline', () => {
        // All assessed -> 7 connecting edges (closed heptagon).
        const { container } = render(
            <SkillsRadar skills={skills([0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5])} />
        )
        expect(container.querySelectorAll('line.stroke-emerald-500')).toHaveLength(7)
    })

    it('hides the decorative SVG from assistive tech', () => {
        const { container } = render(<SkillsRadar skills={skills([0.5, null, null, null, null, null, null])} />)
        expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    })
})
