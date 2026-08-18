import { describe, expect, it } from 'vitest'
import { parseLatexText, type LatexNode } from './latexParser'

const kinds = (nodes: LatexNode[]) => nodes.map((n) => n.kind)

describe('parseLatexText', () => {
    it('keeps plain prose as one text node', () => {
        expect(parseLatexText('Just words.')).toEqual([
            { kind: 'text', value: 'Just words.' },
        ])
    })

    it('splits inline maths out of prose', () => {
        const nodes = parseLatexText('Given $x^2 + 1$ is positive.')
        expect(kinds(nodes)).toEqual(['text', 'inlineMath', 'text'])
        expect(nodes[1]).toEqual({ kind: 'inlineMath', value: 'x^2 + 1' })
    })

    it('recognises $$…$$ as display maths, not two inline spans', () => {
        const nodes = parseLatexText('Evaluate $$\\int_0^1 x^2\\,dx$$ exactly.')
        expect(kinds(nodes)).toEqual(['text', 'displayMath', 'text'])
        expect(nodes[1]).toEqual({
            kind: 'displayMath',
            value: '\\int_0^1 x^2\\,dx',
        })
    })

    it('turns \\\\ outside maths into a line break', () => {
        const nodes = parseLatexText('First line.\\\\Second line.')
        expect(kinds(nodes)).toEqual(['text', 'break', 'text'])
    })

    it('leaves \\\\ inside maths alone — it is KaTeX row separator', () => {
        const nodes = parseLatexText(
            '$$\\begin{aligned} a &= 1 \\\\ b &= 2 \\end{aligned}$$'
        )
        expect(kinds(nodes)).toEqual(['displayMath'])
        // The row separator must survive intact for KaTeX to lay out rows.
        expect((nodes[0] as { value: string }).value).toContain('\\\\')
    })

    it('builds a numbered list from enumerate/item', () => {
        const nodes = parseLatexText(
            '\\begin{enumerate}\\item First\\item Second\\end{enumerate}'
        )
        expect(kinds(nodes)).toEqual(['list'])
        const list = nodes[0] as Extract<LatexNode, { kind: 'list' }>
        expect(list.ordered).toBe(true)
        expect(list.items).toHaveLength(2)
        expect(list.items[0][0]).toEqual({ kind: 'text', value: ' First' })
    })

    it('builds a bulleted list from itemize', () => {
        const nodes = parseLatexText(
            '\\begin{itemize}\\item Only one\\end{itemize}'
        )
        const list = nodes[0] as Extract<LatexNode, { kind: 'list' }>
        expect(list.ordered).toBe(false)
        expect(list.items).toHaveLength(1)
    })

    it('allows maths inside a list item', () => {
        const nodes = parseLatexText(
            '\\begin{enumerate}\\item Show $x>0$\\end{enumerate}'
        )
        const list = nodes[0] as Extract<LatexNode, { kind: 'list' }>
        expect(kinds(list.items[0])).toEqual(['text', 'inlineMath'])
    })

    it('nests environments', () => {
        const nodes = parseLatexText(
            '\\begin{enumerate}\\item Outer' +
                '\\begin{itemize}\\item Inner\\end{itemize}' +
                '\\end{enumerate}'
        )
        const outer = nodes[0] as Extract<LatexNode, { kind: 'list' }>
        expect(outer.ordered).toBe(true)
        const inner = outer.items[0].find((n) => n.kind === 'list')
        expect(inner).toBeDefined()
        expect((inner as Extract<LatexNode, { kind: 'list' }>).ordered).toBe(
            false
        )
    })

    it('keeps prose before and after a list', () => {
        const nodes = parseLatexText(
            'Consider:\\begin{enumerate}\\item A\\end{enumerate}Which holds?'
        )
        expect(kinds(nodes)).toEqual(['text', 'list', 'text'])
    })

    // --- authoring mistakes must degrade, never crash or swallow content ---

    it('still renders an unclosed environment', () => {
        const nodes = parseLatexText('\\begin{enumerate}\\item Dangling')
        expect(kinds(nodes)).toEqual(['list'])
        const list = nodes[0] as Extract<LatexNode, { kind: 'list' }>
        expect(list.items[0][0]).toEqual({ kind: 'text', value: ' Dangling' })
    })

    it('ignores a stray \\end without crashing', () => {
        expect(() => parseLatexText('text\\end{enumerate}more')).not.toThrow()
        expect(
            parseLatexText('text\\end{enumerate}more').length
        ).toBeGreaterThan(0)
    })

    it('treats a stray \\item outside a list as a break', () => {
        expect(kinds(parseLatexText('a\\item b'))).toEqual([
            'text',
            'break',
            'text',
        ])
    })

    it('handles the whole dialect in one string', () => {
        const nodes = parseLatexText(
            'Prove:\\\\$$a^2+b^2=c^2$$\\begin{enumerate}\\item For $a=3$\\end{enumerate}'
        )
        expect(kinds(nodes)).toEqual(['text', 'break', 'displayMath', 'list'])
    })
})

describe('inline maths across a line break', () => {
    // A published question read as raw LaTeX to students because its fraction
    // was typed across three lines — natural in a textarea, and the old
    // pattern excluded newlines outright.
    it('renders a formula the author wrapped', () => {
        const nodes = parseLatexText(
            'Which expression is equivalent to $\n\\frac{27^{2n+1}}{81^{1-n}}\n$?'
        )

        expect(nodes.map((n) => n.kind)).toEqual(['text', 'inlineMath', 'text'])
        expect(
            nodes.some((n) => n.kind === 'text' && n.value.includes('$'))
        ).toBe(false)
    })

    it('does not let a stray $ reach across a blank line', () => {
        // The reason newlines were banned in the first place. A lone $ in
        // prose must not pair with some later $ and turn the paragraphs
        // between them into maths.
        const nodes = parseLatexText(
            'The price is $5 for one paper.\n\nSolve $x^2 = 9$ for x.'
        )

        const maths = nodes.filter((n) => n.kind === 'inlineMath')
        expect(maths).toHaveLength(1)
        expect((maths[0] as { value: string }).value).toBe('x^2 = 9')
    })

    it('still treats a blank line inside $…$ as unpaired', () => {
        const nodes = parseLatexText('$a\n\nb$')
        expect(nodes.filter((n) => n.kind === 'inlineMath')).toHaveLength(0)
    })

    it('leaves display maths spanning blank lines alone', () => {
        // $$…$$ has always been allowed to span anything; only the inline
        // rule changed.
        const nodes = parseLatexText(
            '$$\n\\begin{aligned}\na &= b \\\\\n\nc &= d\n\\end{aligned}\n$$'
        )
        expect(nodes.filter((n) => n.kind === 'displayMath')).toHaveLength(1)
    })
})
