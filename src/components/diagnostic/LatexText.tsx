import { Fragment } from 'react'
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import { parseLatexText, type LatexNode } from './latexParser.ts'

/**
 * Renders question content: plain prose interleaved with LaTeX, in the
 * Overleaf-ish dialect authors actually write.
 *
 *   "Given that $x^2 + kx + 9 = 0$ has equal roots..."      inline maths
 *   "$$\int_0^1 x^2\,dx$$"                                  display maths
 *   "First line.\\Second line."                             line break
 *   "\begin{enumerate}\item One \item Two\end{enumerate}"   numbered list
 *
 * Deliberately the one component for this — the admin form's live preview,
 * the student preview, the set review and the exam screen all render through
 * it, so what an author sees while writing is what a student sits.
 *
 * Parsing lives in latexText.ts so the grammar can be unit-tested without a
 * DOM; this file is only the rendering.
 */
export function LatexText({ text }: { text: string }) {
    return <>{renderNodes(parseLatexText(text))}</>
}

function renderNodes(nodes: LatexNode[]) {
    return nodes.map((node, i) => {
        switch (node.kind) {
            case 'text':
                return <Fragment key={i}>{node.value}</Fragment>
            case 'inlineMath':
                return <InlineMath key={i} math={node.value} />
            case 'displayMath':
                // KaTeX centres display maths in its own block, so it needs
                // no wrapper of ours.
                return <BlockMath key={i} math={node.value} />
            case 'break':
                return <br key={i} />
            case 'list': {
                const items = node.items.map((item, j) => (
                    <li key={j}>{renderNodes(item)}</li>
                ))
                return node.ordered ? (
                    <ol
                        key={i}
                        className="my-2 flex list-decimal flex-col gap-1 pl-6"
                    >
                        {items}
                    </ol>
                ) : (
                    <ul
                        key={i}
                        className="my-2 flex list-disc flex-col gap-1 pl-6"
                    >
                        {items}
                    </ul>
                )
            }
        }
    })
}
