import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { LatexText } from './LatexText'

describe('LatexText', () => {
    it('renders plain text with no $...$ segments as-is', () => {
        const { container } = render(<LatexText text="Just plain text, no maths here." />)
        expect(container.textContent).toBe('Just plain text, no maths here.')
        expect(container.querySelector('.katex')).toBeNull()
    })

    it('renders a single $...$ segment via KaTeX, keeping surrounding text', () => {
        const { container } = render(<LatexText text="Given that $x^2 = 4$, find x." />)
        expect(container.textContent).toContain('Given that')
        expect(container.textContent).toContain('find x.')
        expect(container.querySelectorAll('.katex')).toHaveLength(1)
    })

    it('renders multiple $...$ segments in one string, matching the real seed data shape', () => {
        // Mirrors supabase/seed-data/esat_mathsii_bulk_import.json's actual
        // stem format: multiple math segments interleaved with prose.
        const { container } = render(
            <LatexText text="Given that $(x-1)^2$ and $(x-2)$ are factors of $x^4 + ax^3$, find $a$." />
        )
        expect(container.querySelectorAll('.katex')).toHaveLength(4)
        expect(container.textContent).toContain('Given that')
        expect(container.textContent).toContain('and')
        expect(container.textContent).toContain('are factors of')
        expect(container.textContent).toContain('find')
    })

    it('renders a string that is entirely one $...$ segment with no surrounding text', () => {
        const { container } = render(<LatexText text="$E = mc^2$" />)
        expect(container.querySelectorAll('.katex')).toHaveLength(1)
    })
})
