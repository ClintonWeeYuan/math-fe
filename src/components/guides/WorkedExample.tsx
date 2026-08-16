import { useState } from 'react'
import type { WorkedExample as Example } from '@/content/guideTypes.ts'

/**
 * A worked example on a guide page — answerable when the content gives it
 * options, plain prose when it doesn't.
 *
 * **The whole solution is in the DOM from first paint.** Every step, the
 * answer, the trap and every option's misconception are rendered up front and
 * hidden with the `hidden` attribute; interaction only unhides them. That is
 * not a stylistic choice: these pages are meant to rank on having crawlable
 * worked solutions, so anything written as a conditional render
 * (`{shown && ...}`) would be absent from the HTML Google reads — which is
 * precisely the content the page exists for. Please don't tidy these into
 * conditional renders.
 *
 * The reader answers before seeing anything, because a solution you have
 * already committed against teaches more than one you have only read. A wrong
 * answer names the specific misconception behind *that* option, which is the
 * thing this site has that a textbook hasn't.
 */
export function WorkedExample({ example }: { example: Example }) {
    const { options } = example
    const correct = options?.find((o) => o.isCorrect)

    const [chosen, setChosen] = useState<string | null>(null)
    /** Steps revealed so far; `done` once the answer and trap are out. */
    const [revealed, setRevealed] = useState<number | 'done'>(0)

    const locked = chosen !== null
    const gotItRight = chosen !== null && chosen === correct?.letter
    const stepsOut = revealed === 'done' ? example.steps.length : revealed
    const solutionOut = revealed === 'done'

    function reset() {
        setChosen(null)
        setRevealed(0)
    }

    function advance() {
        setRevealed((r) =>
            r === 'done' || r >= example.steps.length ? 'done' : r + 1
        )
    }

    return (
        <article
            id={example.id}
            className="mb-6 rounded-xl border border-slate-200 p-5"
        >
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                {example.module}
            </p>
            <p className="font-medium text-slate-900 leading-relaxed mb-4">
                {example.question}
            </p>

            {options && (
                <ul className="mb-4 flex flex-col gap-2">
                    {options.map((option) => {
                        // After an answer: the right one is always marked, and
                        // the reader's own wrong pick is marked as theirs.
                        // Nothing else changes, so the page doesn't turn into a
                        // wall of red.
                        const state = !locked
                            ? undefined
                            : option.isCorrect
                              ? 'correct'
                              : option.letter === chosen
                                ? 'wrong'
                                : undefined
                        return (
                            <li key={option.letter}>
                                <button
                                    type="button"
                                    disabled={locked}
                                    onClick={() => setChosen(option.letter)}
                                    aria-pressed={option.letter === chosen}
                                    className={[
                                        'flex w-full items-baseline gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                                        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900',
                                        'motion-reduce:transition-none',
                                        state === 'correct'
                                            ? 'border-emerald-300 bg-emerald-50'
                                            : state === 'wrong'
                                              ? 'border-red-300 bg-red-50'
                                              : 'border-slate-200 hover:bg-slate-50 disabled:hover:bg-transparent',
                                    ].join(' ')}
                                >
                                    <span
                                        className={
                                            state === 'correct'
                                                ? 'font-semibold text-emerald-700'
                                                : state === 'wrong'
                                                  ? 'font-semibold text-red-700'
                                                  : 'font-semibold text-slate-400'
                                        }
                                    >
                                        {option.letter}
                                    </span>
                                    <span>{option.text}</span>
                                </button>
                            </li>
                        )
                    })}
                </ul>
            )}

            {/* Verdict. Rendered always, hidden until answered — see the note
                at the top about why this is not a conditional render. */}
            {options && (
                <p
                    hidden={!locked}
                    className={`mb-2 text-sm font-medium ${
                        gotItRight ? 'text-emerald-700' : 'text-red-700'
                    }`}
                >
                    {gotItRight
                        ? `Correct — ${correct?.letter}.`
                        : `Not quite — the answer is ${correct?.letter}.`}
                </p>
            )}

            {/* Every misconception is in the HTML; only the one matching the
                reader's answer is unhidden. A crawler sees all of them, which
                is the point — they are the part no competitor has. */}
            {options?.map((option) =>
                option.misconception ? (
                    <p
                        key={option.letter}
                        hidden={!(locked && option.letter === chosen)}
                        className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600"
                    >
                        <strong className="font-semibold text-slate-800">
                            Your step:
                        </strong>{' '}
                        {option.misconception}
                    </p>
                ) : null
            )}

            {options && (
                <div hidden={!locked} className="mb-4 flex flex-wrap gap-2">
                    <button
                        type="button"
                        hidden={solutionOut}
                        onClick={advance}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                    >
                        {stepsOut === 0
                            ? 'Show the method, step by step'
                            : stepsOut < example.steps.length
                              ? 'Next step'
                              : 'Show the answer'}
                    </button>
                    <button
                        type="button"
                        onClick={reset}
                        className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                    >
                        Try it again
                    </button>
                </div>
            )}

            {/* Steps: all present, revealed one at a time when the example is
                interactive, and all visible from the start when it isn't. */}
            <ol className="list-decimal pl-5 mb-4">
                {example.steps.map((step, i) => (
                    <li
                        key={i}
                        hidden={options !== undefined && i >= stepsOut}
                        className="text-slate-600 leading-relaxed mb-2"
                    >
                        {step}
                    </li>
                ))}
            </ol>

            <p
                hidden={options !== undefined && !solutionOut}
                className="font-semibold text-slate-900 mb-3"
            >
                Answer: {example.answer}
            </p>
            <p
                hidden={options !== undefined && !solutionOut}
                className="text-sm text-slate-500 leading-relaxed"
            >
                {example.takeaway}
            </p>
        </article>
    )
}
