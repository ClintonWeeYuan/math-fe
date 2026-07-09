import { Fragment } from 'react'
import { InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'

const DOLLAR_DELIMITED = /\$([^$]+)\$/g

/**
 * Renders a string containing plain text interleaved with $...$-delimited
 * LaTeX segments (the stem/option format used throughout
 * docs/diagnostic-platform-spec.md §9, e.g. "Given that $x^2 + kx + 9 = 0$
 * has equal roots..."). Unlike the existing BlockMath usage in
 * MultipleChoiceQuestion.tsx, which renders a value that's pure LaTeX with
 * no delimiters, diagnostic content mixes both in one string.
 *
 * Deliberately the one component for this: used here for the admin form's
 * live preview pane, and meant to be the same component the Stage 4
 * exam-taking screen renders stems/options with — not a second,
 * possibly-inconsistent implementation once that screen exists.
 */
export function LatexText({ text }: { text: string }) {
    const parts: { key: number; content: string; isMath: boolean }[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null
    let key = 0
    DOLLAR_DELIMITED.lastIndex = 0

    while ((match = DOLLAR_DELIMITED.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({
                key: key++,
                content: text.slice(lastIndex, match.index),
                isMath: false,
            })
        }
        parts.push({ key: key++, content: match[1], isMath: true })
        lastIndex = DOLLAR_DELIMITED.lastIndex
    }
    if (lastIndex < text.length) {
        parts.push({ key: key++, content: text.slice(lastIndex), isMath: false })
    }

    return (
        <>
            {parts.map((part) =>
                part.isMath ? (
                    <InlineMath key={part.key} math={part.content} />
                ) : (
                    <Fragment key={part.key}>{part.content}</Fragment>
                )
            )}
        </>
    )
}
