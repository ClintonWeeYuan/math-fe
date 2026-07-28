/**
 * Named latexParser, not latexText: a module differing from LatexText.tsx
 * only by case resolves back to the component itself on a case-insensitive
 * filesystem, which silently makes both exports undefined.
 *
 * Parser for the question-content dialect: plain prose interleaved with
 * LaTeX. Authors write questions the way they would in Overleaf, so beyond
 * `$…$` we support:
 *
 *   - `$$…$$`   display maths on its own line
 *   - `\\`      a line break *outside* maths
 *   - `\begin{enumerate}` / `\begin{itemize}` with `\item`, nestable
 *
 * Everything inside a maths span is handed to KaTeX untouched — a `\\` in an
 * `aligned` block is KaTeX's row separator and must not be stolen by the
 * line-break rule, which is why maths is tokenised first.
 */

export type LatexNode =
    | { kind: 'text'; value: string }
    | { kind: 'inlineMath'; value: string }
    | { kind: 'displayMath'; value: string }
    | { kind: 'break' }
    | { kind: 'list'; ordered: boolean; items: LatexNode[][] }

/** One pass over the source: maths first (so its backslashes are never
 * reinterpreted), then the structural commands. */
const TOKEN =
    /(\$\$[\s\S]*?\$\$)|(\$[^$\n]*?\$)|(\\begin\{(?:enumerate|itemize)\})|(\\end\{(?:enumerate|itemize)\})|(\\item\b)|(\\\\)/g

type Frame = { ordered: boolean; items: LatexNode[][] }

export function parseLatexText(source: string): LatexNode[] {
    const root: LatexNode[] = []
    // Each open environment pushes a frame; `current` always points at the
    // node list being filled (the document, or the newest \item).
    const stack: Frame[] = []

    const current = (): LatexNode[] => {
        if (stack.length === 0) return root
        const frame = stack[stack.length - 1]
        if (frame.items.length === 0) frame.items.push([])
        return frame.items[frame.items.length - 1]
    }

    const pushText = (value: string) => {
        if (value === '') return
        current().push({ kind: 'text', value })
    }

    let lastIndex = 0
    let match: RegExpExecArray | null
    TOKEN.lastIndex = 0

    while ((match = TOKEN.exec(source)) !== null) {
        pushText(source.slice(lastIndex, match.index))
        lastIndex = TOKEN.lastIndex

        const [, display, inline, begin, end, item, lineBreak] = match

        if (display !== undefined) {
            current().push({ kind: 'displayMath', value: display.slice(2, -2).trim() })
        } else if (inline !== undefined) {
            current().push({ kind: 'inlineMath', value: inline.slice(1, -1) })
        } else if (begin !== undefined) {
            stack.push({ ordered: begin.includes('enumerate'), items: [] })
        } else if (end !== undefined) {
            const frame = stack.pop()
            if (frame === undefined) continue // stray \end — ignore, don't crash
            current().push({
                kind: 'list',
                ordered: frame.ordered,
                items: frame.items,
            })
        } else if (item !== undefined) {
            const frame = stack[stack.length - 1]
            // A stray \item outside any environment is treated as a break so
            // the text still reads sensibly rather than vanishing.
            if (frame === undefined) current().push({ kind: 'break' })
            else frame.items.push([])
        } else if (lineBreak !== undefined) {
            current().push({ kind: 'break' })
        }
    }
    pushText(source.slice(lastIndex))

    // An unclosed environment still renders its items, rather than silently
    // swallowing the rest of the question.
    while (stack.length > 0) {
        const frame = stack.pop()
        if (frame === undefined) break
        current().push({ kind: 'list', ordered: frame.ordered, items: frame.items })
    }

    return root
}
